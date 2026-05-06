import type { QuizProfile } from "@/entities/quiz-profile";

export type QuizPhase = "intro" | "step" | "review" | "completed";

/** answers map: questionId → committed answerIds (selection order preserved). */
export type AnswersMap = Record<string, string[]>;

export interface QuizState {
  phase: QuizPhase;
  currentStepIndex: number;
  answers: AnswersMap;
  /** Set on COMPLETE; null until then. */
  completedProfile: QuizProfile | null;
}

export type QuizAction =
  | { type: "INIT" }
  | { type: "HYDRATE"; state: QuizState }
  | { type: "START" }
  | { type: "EDIT_DRAFT_ANSWER"; questionId: string; answerIds: string[] }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "GOTO_STEP"; index: number }
  | { type: "RESTART" }
  | { type: "COMPLETE"; profile: QuizProfile };

export const initialQuizState: QuizState = {
  phase: "intro",
  currentStepIndex: 0,
  answers: {},
  completedProfile: null,
};
