"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import type { QuizQuestion, QuestionArea } from "@/entities/question";
import { buildProfile } from "@/entities/quiz-profile";
import type { Locale } from "@/shared/i18n/config";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import {
  QuizProvider,
  useQuizDispatch,
  useQuizState,
} from "@/features/quiz/model/context";
import { isAnswerValid } from "@/features/quiz/model/reducer";
import {
  clearAll,
  readDraft,
  writeDraft,
  writeProfile,
} from "@/features/quiz/model/storage";

import { MovementMap } from "./movement-map";
import { Navigator } from "./navigator";
import { RestartConfirm } from "./restart";
import { Review } from "./review";
import { QuestionTypeDispatcher } from "./types";
import type { AnswerOption } from "./types";

interface QuizAppProps {
  questions: QuizQuestion[];
  locale: Locale;
}

/** Public surface — wraps the inner orchestrator in the Provider. */
export function QuizApp({ questions, locale }: QuizAppProps) {
  return (
    <QuizProvider questions={questions}>
      <QuizAppInner questions={questions} locale={locale} />
    </QuizProvider>
  );
}

function QuizAppInner({ questions, locale }: QuizAppProps) {
  const router = useRouter();
  const state = useQuizState();
  const dispatch = useQuizDispatch();
  const t = useTranslations("quiz.ui");
  const tIntro = useTranslations("quiz.ui.intro");
  const [restartOpen, setRestartOpen] = useState(false);
  const firstStepRef = useRef<HTMLDivElement>(null);

  // ---- Hydration (mount-only) -------------------------------------------
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const draft = readDraft();
    if (draft) dispatch({ type: "HYDRATE", state: draft });
  }, [dispatch]);

  // ---- Storage on commit-only phase / index changes (constraint #41) ----
  // Persist when the reducer transitions to a new "committed" state — i.e.
  // phase or currentStepIndex change — and skip while there's nothing
  // worth persisting (intro pre-Start; pre-first-answer step). The ref
  // updates BEFORE the bail-outs so EDIT_DRAFT_ANSWER edits at the same
  // (phase, index) re-enter with key === ref and bail without writing —
  // that is the constraint #41 invariant the persist effect is enforcing.
  const lastPersistKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!hydratedRef.current) return;
    const key = `${state.phase}::${state.currentStepIndex}`;
    if (key === lastPersistKeyRef.current) return;
    lastPersistKeyRef.current = key;
    if (state.phase === "intro") return;
    if (state.phase === "completed") return; // writeProfile owns that key
    if (Object.keys(state.answers).length === 0) return; // nothing to persist yet
    writeDraft(state);
  }, [state]);

  // ---- Resolve current question's translated props ----------------------
  const tFreeKey = useTranslations(); // root-scope translator for arbitrary keys
  const resolveAnswers = (q: QuizQuestion): AnswerOption[] =>
    q.answers.map((a) => ({
      id: a.id,
      label: tFreeKey(a.labelKey as Parameters<typeof tFreeKey>[0]),
      hint: a.hintKey ? tFreeKey(a.hintKey as Parameters<typeof tFreeKey>[0]) : undefined,
    }));
  const resolvePrompt = (q: QuizQuestion) =>
    tFreeKey(q.promptKey as Parameters<typeof tFreeKey>[0]);
  const resolveSubtitle = (q: QuizQuestion) =>
    q.subtitleKey ? tFreeKey(q.subtitleKey as Parameters<typeof tFreeKey>[0]) : undefined;

  const currentQuestion = questions[state.currentStepIndex];
  const currentDraft = currentQuestion ? state.answers[currentQuestion.id] ?? [] : [];
  const canGoNext = currentQuestion ? isAnswerValid(currentQuestion, currentDraft) : false;
  const canGoBack = state.phase === "step" && state.currentStepIndex > 0;

  // Lit areas: any area whose questions have at least one committed answer.
  // Memoized so MovementMap doesn't see a fresh Set identity every render.
  const litAreas: ReadonlySet<QuestionArea> = useMemo(
    () =>
      new Set(
        questions
          .filter((q) => (state.answers[q.id]?.length ?? 0) > 0)
          .map((q) => q.area),
      ),
    [questions, state.answers],
  );

  // ---- Action handlers --------------------------------------------------
  const handleNext = () => dispatch({ type: "NEXT" });
  const handleBack = () => dispatch({ type: "BACK" });
  const handleEdit = (index: number) => dispatch({ type: "GOTO_STEP", index });
  const handleStart = () => dispatch({ type: "START" });
  const handleRestartTrigger = () => setRestartOpen(true);
  const handleRestartCancel = () => setRestartOpen(false);
  const handleRestartConfirm = () => {
    clearAll();
    // RESTART zeroes state to intro; immediately advance to step 1 so the
    // focus-first-interactive sequence (constraint #43) lands on a real
    // step-1 control rather than the intro Start button.
    dispatch({ type: "RESTART" });
    dispatch({ type: "START" });
    setRestartOpen(false);
    // Defer focus until after the next paint so the dispatched step renders.
    queueMicrotask(() => {
      const target = firstStepRef.current?.querySelector<HTMLElement>(
        "[role=radio], [role=checkbox], [role=slider], button",
      );
      target?.focus();
    });
  };
  const handleSeeResults = () => {
    if (state.phase !== "review" && !currentQuestion) return;
    const profile = buildProfile(
      questions,
      Object.entries(state.answers)
        .filter(([, ids]) => ids.length > 0)
        .map(([questionId, answerIds]) => ({ questionId, answerIds })),
    );
    writeProfile(profile);
    dispatch({ type: "COMPLETE", profile });
    router.push(`/${locale}/results`);
  };

  // ---- Render -----------------------------------------------------------
  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-5xl flex-col gap-(--space-6) p-(--space-4)"
    >
      <div
        className={cn(
          "grid gap-(--space-6)",
          // Stack on narrow viewports; sidebar + content on wider.
          "grid-cols-1 lg:grid-cols-[18rem_1fr]",
        )}
      >
        <aside className="lg:order-1">
          <MovementMap litAreas={litAreas} />
        </aside>
        <section ref={firstStepRef} className="flex flex-col gap-(--space-4) lg:order-2">
          {state.phase === "intro" ? (
            <Card variant="gradient">
              <CardHeader>
                <h1 className="text-2xl font-bold tracking-tight break-words">
                  {tIntro("title")}
                </h1>
              </CardHeader>
              <CardBody className="flex flex-col gap-(--space-4)">
                <p className="text-(--color-ink) break-words">{tIntro("subtitle")}</p>
                <div>
                  <Button variant="primary" size="lg" onClick={handleStart}>
                    {tIntro("start")}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {state.phase === "step" && currentQuestion && !restartOpen ? (
            <>
              <p className="text-sm text-(--color-ink-muted)">
                {t("stepLabel", {
                  n: state.currentStepIndex + 1,
                  total: questions.length,
                })}
              </p>
              <QuestionTypeDispatcher
                question={currentQuestion}
                prompt={resolvePrompt(currentQuestion)}
                subtitle={resolveSubtitle(currentQuestion)}
                answers={resolveAnswers(currentQuestion)}
                value={currentDraft}
                onChange={(answerIds) =>
                  dispatch({
                    type: "EDIT_DRAFT_ANSWER",
                    questionId: currentQuestion.id,
                    answerIds,
                  })
                }
              />
              <Navigator
                stepNumber={state.currentStepIndex + 1}
                total={questions.length}
                canGoBack={canGoBack}
                canGoNext={canGoNext}
                onBack={handleBack}
                onNext={handleNext}
                onRestart={handleRestartTrigger}
              />
            </>
          ) : null}

          {state.phase === "review" && !restartOpen ? (
            <Review
              questions={questions}
              answers={state.answers}
              translate={(key) => tFreeKey(key as Parameters<typeof tFreeKey>[0])}
              onEdit={handleEdit}
              onSeeResults={handleSeeResults}
              onBack={handleBack}
              onRestart={handleRestartTrigger}
            />
          ) : null}

          {restartOpen ? (
            <RestartConfirm
              onConfirm={handleRestartConfirm}
              onCancel={handleRestartCancel}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
