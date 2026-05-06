import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

import type { QuizQuestion } from "@/entities/question";

import { QuizProvider, useQuizDispatch, useQuizState } from "./context";
import { initialQuizState } from "./types";

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q-1",
    type: "single",
    area: "social",
    promptKey: "k.q1",
    answers: [
      { id: "a", labelKey: "k.a", tagWeights: { x: 1 } },
      { id: "b", labelKey: "k.b", tagWeights: { y: 1 } },
    ],
  },
];

describe("QuizProvider context", () => {
  it("exposes initial state through useQuizState", () => {
    const { result } = renderHook(() => useQuizState(), {
      wrapper: ({ children }) => (
        <QuizProvider questions={QUESTIONS}>{children}</QuizProvider>
      ),
    });
    expect(result.current).toEqual(initialQuizState);
  });

  it("exposes a dispatch function through useQuizDispatch", () => {
    const { result } = renderHook(() => useQuizDispatch(), {
      wrapper: ({ children }) => (
        <QuizProvider questions={QUESTIONS}>{children}</QuizProvider>
      ),
    });
    expect(typeof result.current).toBe("function");
  });

  it("useQuizState outside Provider throws a helpful error", () => {
    expect(() => renderHook(() => useQuizState())).toThrow(/QuizProvider/i);
  });

  it("useQuizDispatch outside Provider throws a helpful error", () => {
    expect(() => renderHook(() => useQuizDispatch())).toThrow(/QuizProvider/i);
  });
});
