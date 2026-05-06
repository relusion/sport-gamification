import type { z } from "zod";

import type { QuizAnswer } from "@/entities/answer";

import type { QuestionType } from "./schema";

// Pre-inference shape: superRefine runs before z.infer, so QuizQuestion can't
// be referenced here without a circular type. Mirroring just `type` + `answers`
// keeps the contract narrow and explicit.
interface RefinableQuestion {
  type: QuestionType;
  answers: QuizAnswer[];
}

const SLIDER_MIN = 3;
const SLIDER_MAX = 7;
const WYR_EXACT = 2;

/**
 * Per-question-type answer-count rules (constraint #38). Applied via
 * `.superRefine(refineByType)` on `QuizQuestionSchema` so authoring errors fail
 * the build with a path-pointed Zod issue rather than slipping into a render
 * crash. Rule shape stays additive — `single`/`multi`/`visual`/`ranking` rely
 * on the existing `min(2)` array constraint and only the type-specific
 * boundaries land here.
 */
export function refineByType(question: RefinableQuestion, ctx: z.RefinementCtx): void {
  switch (question.type) {
    case "would-you-rather":
      if (question.answers.length !== WYR_EXACT) {
        ctx.addIssue({
          code: "custom",
          path: ["answers"],
          message: `would-you-rather requires exactly 2 answers (got ${question.answers.length})`,
        });
      }
      return;
    case "slider":
      if (question.answers.length < SLIDER_MIN || question.answers.length > SLIDER_MAX) {
        ctx.addIssue({
          code: "custom",
          path: ["answers"],
          message: `slider requires between 3 and 7 stops (got ${question.answers.length})`,
        });
      }
      return;
    case "single":
    case "multi":
    case "visual":
    case "ranking":
      return;
  }
}
