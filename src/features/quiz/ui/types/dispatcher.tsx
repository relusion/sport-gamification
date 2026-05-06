"use client";

import { useTranslations } from "next-intl";

import type { QuizQuestion } from "@/entities/question";

import { MultiCard } from "./multi-card";
import { RankingCard } from "./ranking-card";
import { SingleCard } from "./single-card";
import { SliderCard } from "./slider-card";
import type { AnswerOption } from "./types";
import { VisualCard } from "./visual-card";
import { WouldYouRatherCard } from "./would-you-rather-card";

export interface QuestionTypeDispatcherProps {
  question: QuizQuestion;
  /** Resolved (translated) prompt and answers — feature owns the i18n bind. */
  prompt: string;
  subtitle?: string;
  answers: AnswerOption[];
  /** Current draft answer for this question. */
  value: string[];
  /** Reports the new answer selection (commit happens on NEXT). */
  onChange: (answerIds: string[]) => void;
}

/**
 * Discriminated-union switch over `question.type` (constraint #44). The `never`
 * default branch makes adding a 7th `QuestionType` a TS compile error until a
 * card exists. Do NOT add a runtime fallback — the compile error is the safety
 * mechanism.
 */
export function QuestionTypeDispatcher(props: QuestionTypeDispatcherProps) {
  const { question, ...rest } = props;
  const cardProps = { ...rest, questionId: question.id };
  const tUi = useTranslations("quiz.ui");

  switch (question.type) {
    case "single":
      return <SingleCard {...cardProps} />;
    case "multi":
      return <MultiCard {...cardProps} />;
    case "slider":
      return <SliderCard {...cardProps} />;
    case "ranking":
      return (
        <RankingCard
          {...cardProps}
          rowAriaLabel={(position, label) => tUi("rankingRow", { position, label })}
          moveUpAriaLabel={(label) => tUi("rankingMoveUp", { label })}
          moveDownAriaLabel={(label) => tUi("rankingMoveDown", { label })}
        />
      );
    case "would-you-rather":
      return <WouldYouRatherCard {...cardProps} />;
    case "visual":
      return <VisualCard {...cardProps} />;
    default: {
      const _exhaustive: never = question.type;
      throw new Error(`Unhandled question type: ${String(_exhaustive)}`);
    }
  }
}
