import type { QuizQuestion } from "@/entities/question";

import { QuizProfileSchema, type QuizProfile } from "./schema";

export interface CommittedAnswer {
  questionId: string;
  answerIds: string[];
}

/**
 * Pure profile aggregator (constraints #45, #19). Sums each selected answer's
 * `tagWeights` into the profile's `tagScores` map. Multi-select sums weights
 * across all selected answers within a step. Ranking weights are pre-authored
 * per-position; this helper does NOT invent ranking contribution.
 *
 * The non-negative invariant (#22 today; defensive going forward) is enforced
 * here too: if a future authoring change ever introduces negative weights,
 * negative cumulative scores clamp at 0 rather than serializing through and
 * tripping `QuizProfileSchema.nonnegative` at the boundary.
 */
export function buildProfile(
  questions: QuizQuestion[],
  answers: CommittedAnswer[],
): QuizProfile {
  const questionIndex = new Map<string, QuizQuestion>();
  for (const q of questions) questionIndex.set(q.id, q);

  const tagScores: Record<string, number> = {};

  for (const committed of answers) {
    const question = questionIndex.get(committed.questionId);
    if (!question) continue;
    for (const answerId of committed.answerIds) {
      const answer = question.answers.find((a) => a.id === answerId);
      if (!answer) continue;
      for (const [tag, weight] of Object.entries(answer.tagWeights)) {
        tagScores[tag] = (tagScores[tag] ?? 0) + weight;
      }
    }
  }

  for (const tag of Object.keys(tagScores)) {
    if ((tagScores[tag] ?? 0) < 0) tagScores[tag] = 0;
  }

  // Producer-side validation (defence in depth on the cross-feature contract,
  // constraint #37). 04 still `safeParse`s on read; this guards against
  // upstream type-only changes ever shipping a schema-invalid profile.
  return QuizProfileSchema.parse({
    version: 1,
    tagScores,
    answers,
  });
}
