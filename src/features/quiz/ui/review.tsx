"use client";

import { useTranslations } from "next-intl";

import type { QuizQuestion } from "@/entities/question";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";

interface ReviewProps {
  questions: QuizQuestion[];
  /** Map: questionId → committed answerIds (selection order preserved). */
  answers: Record<string, string[]>;
  /** Resolves a quiz translation key (promptKey / labelKey) to its localized string. */
  translate: (key: string) => string;
  onEdit: (questionIndex: number) => void;
  onSeeResults: () => void;
  /** Optional back-to-last-step affordance shown in the header. */
  onBack?: () => void;
  /** Optional restart affordance shown next to back. */
  onRestart?: () => void;
  className?: string;
}

/**
 * Final review screen (constraint #50). Lists every question with its
 * committed answer label(s). "Edit" jumps to that step; "See results" is the
 * COMPLETE trigger. The CTA is only enabled when every step is answered —
 * the parent guarantees that by only routing here from `phase === "review"`,
 * but we render the disabled state defensively.
 */
export function Review({
  questions,
  answers,
  translate,
  onEdit,
  onSeeResults,
  onBack,
  onRestart,
  className,
}: ReviewProps) {
  const t = useTranslations("quiz.ui.review");
  const tNav = useTranslations("quiz.ui");

  const allAnswered = questions.every((q) => (answers[q.id]?.length ?? 0) > 0);

  return (
    <div className={cn("flex flex-col gap-(--space-4)", className)}>
      <header className="flex flex-wrap items-end justify-between gap-(--space-3)">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="mt-(--space-2) text-(--color-ink-muted)">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-(--space-2)">
          {onBack ? (
            <Button variant="ghost" size="md" onClick={onBack}>
              {tNav("back")}
            </Button>
          ) : null}
          {onRestart ? (
            <Button variant="ghost" size="md" onClick={onRestart}>
              {tNav("restart")}
            </Button>
          ) : null}
        </div>
      </header>
      <ol className="flex list-none flex-col gap-(--space-3)">
        {questions.map((question, index) => {
          const committed = answers[question.id] ?? [];
          const labels = committed
            .map((id) => question.answers.find((a) => a.id === id)?.labelKey)
            .filter((k): k is string => typeof k === "string")
            .map(translate);
          return (
            <li key={question.id}>
              <Card>
                <CardHeader>
                  <span className="block text-xs font-medium text-(--color-ink-muted) uppercase tracking-wide">
                    {t("questionLabel", { n: index + 1 })}
                  </span>
                  {translate(question.promptKey)}
                </CardHeader>
                <CardBody className="flex flex-wrap items-start justify-between gap-(--space-3)">
                  <p className="flex-1 break-words text-(--color-ink)">
                    {labels.length > 0 ? labels.join(", ") : "—"}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(index)}>
                    {t("edit")}
                  </Button>
                </CardBody>
              </Card>
            </li>
          );
        })}
      </ol>
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={onSeeResults}
          disabled={!allAnswered}
          aria-disabled={!allAnswered}
        >
          {tNav("seeResults")}
        </Button>
      </div>
    </div>
  );
}
