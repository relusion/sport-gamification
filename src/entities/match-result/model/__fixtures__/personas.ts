import type { QuizProfile } from "@/entities/quiz-profile";

/**
 * Five hand-authored personas (constraint #45). Each `tagScores` map is a
 * pragmatic synthesis of the 15 question-source tag ids — the same ids
 * the quiz can deposit via `buildProfile`. They power the snapshot tests
 * in `personas.snapshot.test.ts` and double as a documented set of
 * "shapes the engine must handle gracefully".
 */
function persona(tagScores: Record<string, number>): QuizProfile {
  return { version: 1, tagScores, answers: [] };
}

export const balanced: QuizProfile = persona({
  social: 2,
  team: 2,
  energy: 2,
  burst: 1,
  outdoor: 2,
  indoor: 2,
  freeform: 2,
  structured: 2,
  endurance: 2,
  expression: 1,
  focus: 2,
  calm: 2,
  morning: 1,
  evening: 1,
  practical: 2,
});

export const teamEnergy: QuizProfile = persona({
  social: 4,
  team: 5,
  energy: 4,
  burst: 3,
  outdoor: 3,
  endurance: 2,
  freeform: 1,
  structured: 1,
  focus: 1,
});

export const calmFocus: QuizProfile = persona({
  calm: 5,
  focus: 4,
  indoor: 3,
  structured: 2,
  endurance: 1,
  expression: 1,
  morning: 2,
});

export const outdoorEndurance: QuizProfile = persona({
  outdoor: 5,
  endurance: 4,
  freeform: 3,
  energy: 2,
  morning: 2,
  calm: 1,
  practical: 1,
});

export const expressionRhythm: QuizProfile = persona({
  expression: 5,
  freeform: 4,
  indoor: 3,
  burst: 2,
  evening: 2,
  energy: 1,
  social: 1,
});

export const PERSONAS = {
  balanced,
  "team-energy": teamEnergy,
  "calm-focus": calmFocus,
  "outdoor-endurance": outdoorEndurance,
  "expression-rhythm": expressionRhythm,
} as const;

export type PersonaName = keyof typeof PERSONAS;
