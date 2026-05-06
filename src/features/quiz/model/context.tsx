"use client";

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import type { QuizQuestion } from "@/entities/question";

import { quizReducer } from "./reducer";
import {
  initialQuizState,
  type QuizAction,
  type QuizState,
} from "./types";

// Two contexts so consumers that only need dispatch don't re-render on state
// changes (a measurable win when type-card components subscribe selectively).
const QuizStateContext = createContext<QuizState | null>(null);
const QuizDispatchContext = createContext<Dispatch<QuizAction> | null>(null);

interface QuizProviderProps {
  questions: QuizQuestion[];
  children: ReactNode;
  /** Optional override for hydration / Storybook fixtures. */
  initial?: QuizState;
}

export function QuizProvider({ questions, children, initial }: QuizProviderProps) {
  // useReducer's reducer signature is (state, action) only — bind the
  // questions list via closure. The bound function stays pure: it forwards
  // to quizReducer with no shared mutable state.
  const boundReducer = useCallback(
    (state: QuizState, action: QuizAction) => quizReducer(state, action, questions),
    [questions],
  );
  const [state, dispatch] = useReducer(boundReducer, initial ?? initialQuizState);

  return (
    <QuizStateContext.Provider value={state}>
      <QuizDispatchContext.Provider value={dispatch}>{children}</QuizDispatchContext.Provider>
    </QuizStateContext.Provider>
  );
}

export function useQuizState(): QuizState {
  const value = useContext(QuizStateContext);
  if (value === null) {
    throw new Error("useQuizState must be used inside <QuizProvider>");
  }
  return value;
}

export function useQuizDispatch(): Dispatch<QuizAction> {
  const value = useContext(QuizDispatchContext);
  if (value === null) {
    throw new Error("useQuizDispatch must be used inside <QuizProvider>");
  }
  return value;
}
