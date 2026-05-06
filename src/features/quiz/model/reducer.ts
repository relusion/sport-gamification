import type { QuizQuestion } from "@/entities/question";

import {
  initialQuizState,
  type QuizAction,
  type QuizState,
} from "./types";

/**
 * Per-question-type validity for forward navigation. Mirrors refineByType
 * (entity-side answer-count rules, constraint #38) but operates on selection
 * rather than question shape.
 */
export function isAnswerValid(question: QuizQuestion, answerIds: string[]): boolean {
  const knownIds = new Set(question.answers.map((a) => a.id));
  for (const id of answerIds) if (!knownIds.has(id)) return false;
  switch (question.type) {
    case "single":
    case "would-you-rather":
    case "slider":
      return answerIds.length === 1;
    case "multi":
    case "visual":
      return answerIds.length >= 1;
    case "ranking": {
      // Full ordering, no duplicates.
      if (answerIds.length !== question.answers.length) return false;
      return new Set(answerIds).size === answerIds.length;
    }
  }
}

/**
 * Pure reducer over typed actions (constraints #39, #44). No closures over
 * external state. Defensive `default: return state` keeps the reducer
 * crash-free if junk ever reaches it from hydration.
 */
export function quizReducer(
  state: QuizState,
  action: QuizAction,
  questions: QuizQuestion[],
): QuizState {
  switch (action.type) {
    case "INIT":
      return initialQuizState;

    case "HYDRATE":
      return action.state;

    case "START":
      // Explicit intro→step transition (matches sequence diagram in spec.md).
      // EDIT_DRAFT_ANSWER deliberately does NOT auto-promote — START is the
      // only path so storage-write effects can key cleanly off phase changes.
      if (state.phase !== "intro") return state;
      return { ...state, phase: "step", currentStepIndex: 0 };

    case "EDIT_DRAFT_ANSWER": {
      const nextAnswers = { ...state.answers, [action.questionId]: action.answerIds };
      return { ...state, answers: nextAnswers };
    }

    case "NEXT": {
      if (state.phase !== "step") return state;
      const current = questions[state.currentStepIndex];
      if (!current) return state;
      const draft = state.answers[current.id] ?? [];
      if (!isAnswerValid(current, draft)) return state;
      const isLast = state.currentStepIndex === questions.length - 1;
      if (isLast) return { ...state, phase: "review" };
      return { ...state, currentStepIndex: state.currentStepIndex + 1 };
    }

    case "BACK": {
      if (state.phase === "review") {
        return { ...state, phase: "step", currentStepIndex: questions.length - 1 };
      }
      if (state.phase !== "step") return state;
      if (state.currentStepIndex === 0) return state;
      return { ...state, currentStepIndex: state.currentStepIndex - 1 };
    }

    case "GOTO_STEP": {
      if (action.index < 0 || action.index >= questions.length) return state;
      return { ...state, phase: "step", currentStepIndex: action.index };
    }

    case "RESTART":
      return initialQuizState;

    case "COMPLETE":
      return { ...state, phase: "completed", completedProfile: action.profile };

    default:
      return state;
  }
}
