import { describe, it, expect } from "vitest";

import type { QuizQuestion } from "@/entities/question";
import type { QuizProfile } from "@/entities/quiz-profile";

import { quizReducer, isAnswerValid } from "./reducer";
import { initialQuizState, type QuizState } from "./types";

const singleQuestion: QuizQuestion = {
  id: "q-single",
  type: "single",
  area: "social",
  promptKey: "k.single",
  answers: [
    { id: "a", labelKey: "k.a", tagWeights: { x: 1 } },
    { id: "b", labelKey: "k.b", tagWeights: { y: 1 } },
  ],
};
const multiQuestion: QuizQuestion = {
  id: "q-multi",
  type: "multi",
  area: "movement",
  promptKey: "k.multi",
  answers: [
    { id: "a", labelKey: "k.a", tagWeights: { x: 1 } },
    { id: "b", labelKey: "k.b", tagWeights: { y: 1 } },
    { id: "c", labelKey: "k.c", tagWeights: { z: 1 } },
  ],
};
const sliderQuestion: QuizQuestion = {
  id: "q-slider",
  type: "slider",
  area: "energy",
  promptKey: "k.slider",
  answers: [
    { id: "s0", labelKey: "k.s0", tagWeights: { e: 0.1 } },
    { id: "s1", labelKey: "k.s1", tagWeights: { e: 0.2 } },
    { id: "s2", labelKey: "k.s2", tagWeights: { e: 0.3 } },
  ],
};
const wyrQuestion: QuizQuestion = {
  id: "q-wyr",
  type: "would-you-rather",
  area: "preference",
  promptKey: "k.wyr",
  answers: [
    { id: "a", labelKey: "k.a", tagWeights: { x: 1 } },
    { id: "b", labelKey: "k.b", tagWeights: { y: 1 } },
  ],
};
const visualQuestion: QuizQuestion = {
  id: "q-vis",
  type: "visual",
  area: "environment",
  promptKey: "k.vis",
  answers: [
    { id: "a", labelKey: "k.a", tagWeights: { x: 1 } },
    { id: "b", labelKey: "k.b", tagWeights: { y: 1 } },
    { id: "c", labelKey: "k.c", tagWeights: { z: 1 } },
  ],
};
const rankingQuestion: QuizQuestion = {
  id: "q-rank",
  type: "ranking",
  area: "practical",
  promptKey: "k.rank",
  answers: [
    { id: "a", labelKey: "k.a", tagWeights: { x: 1 } },
    { id: "b", labelKey: "k.b", tagWeights: { y: 1 } },
    { id: "c", labelKey: "k.c", tagWeights: { z: 1 } },
  ],
};

const QUESTIONS = [singleQuestion, multiQuestion, sliderQuestion, wyrQuestion, visualQuestion, rankingQuestion];

describe("isAnswerValid", () => {
  it("single: requires exactly one answerId", () => {
    expect(isAnswerValid(singleQuestion, [])).toBe(false);
    expect(isAnswerValid(singleQuestion, ["a"])).toBe(true);
    expect(isAnswerValid(singleQuestion, ["a", "b"])).toBe(false);
  });
  it("multi: requires at least one answerId", () => {
    expect(isAnswerValid(multiQuestion, [])).toBe(false);
    expect(isAnswerValid(multiQuestion, ["a"])).toBe(true);
    expect(isAnswerValid(multiQuestion, ["a", "b"])).toBe(true);
  });
  it("slider: requires exactly one stop committed", () => {
    expect(isAnswerValid(sliderQuestion, [])).toBe(false);
    expect(isAnswerValid(sliderQuestion, ["s1"])).toBe(true);
    expect(isAnswerValid(sliderQuestion, ["s1", "s2"])).toBe(false);
  });
  it("would-you-rather: exactly one of two", () => {
    expect(isAnswerValid(wyrQuestion, [])).toBe(false);
    expect(isAnswerValid(wyrQuestion, ["a"])).toBe(true);
    expect(isAnswerValid(wyrQuestion, ["a", "b"])).toBe(false);
  });
  it("visual: at least one selected", () => {
    expect(isAnswerValid(visualQuestion, [])).toBe(false);
    expect(isAnswerValid(visualQuestion, ["a"])).toBe(true);
    expect(isAnswerValid(visualQuestion, ["a", "b"])).toBe(true);
  });
  it("ranking: full ordering of all answers (no duplicates)", () => {
    expect(isAnswerValid(rankingQuestion, [])).toBe(false);
    expect(isAnswerValid(rankingQuestion, ["a", "b"])).toBe(false);
    expect(isAnswerValid(rankingQuestion, ["a", "b", "c"])).toBe(true);
    expect(isAnswerValid(rankingQuestion, ["a", "a", "c"])).toBe(false);
  });
});

describe("quizReducer", () => {
  it("INIT returns the initial state regardless of prior phase", () => {
    const next = quizReducer(
      { ...initialQuizState, phase: "review", answers: { "q-single": ["a"] } },
      { type: "INIT" },
      QUESTIONS,
    );
    expect(next).toEqual(initialQuizState);
  });

  it("HYDRATE replaces state with the provided snapshot", () => {
    const snapshot: QuizState = {
      phase: "step",
      currentStepIndex: 2,
      answers: { "q-single": ["a"] },
      completedProfile: null,
    };
    const next = quizReducer(initialQuizState, { type: "HYDRATE", state: snapshot }, QUESTIONS);
    expect(next).toEqual(snapshot);
  });

  it("EDIT_DRAFT_ANSWER stores the draft selection without advancing", () => {
    const next = quizReducer(
      { ...initialQuizState, phase: "step" },
      { type: "EDIT_DRAFT_ANSWER", questionId: "q-single", answerIds: ["a"] },
      QUESTIONS,
    );
    expect(next.answers["q-single"]).toEqual(["a"]);
    expect(next.currentStepIndex).toBe(0);
    expect(next.phase).toBe("step");
  });

  it("NEXT does not advance when current draft is invalid", () => {
    const state: QuizState = {
      ...initialQuizState,
      phase: "step",
      currentStepIndex: 0,
      answers: {}, // q-single has no draft
    };
    const next = quizReducer(state, { type: "NEXT" }, QUESTIONS);
    expect(next.currentStepIndex).toBe(0);
    expect(next.phase).toBe("step");
  });

  it("NEXT advances when the current draft is valid", () => {
    const state: QuizState = {
      ...initialQuizState,
      phase: "step",
      currentStepIndex: 0,
      answers: { "q-single": ["a"] },
    };
    const next = quizReducer(state, { type: "NEXT" }, QUESTIONS);
    expect(next.currentStepIndex).toBe(1);
  });

  it("NEXT moves to review on the last step when valid", () => {
    const lastIndex = QUESTIONS.length - 1;
    const state: QuizState = {
      ...initialQuizState,
      phase: "step",
      currentStepIndex: lastIndex,
      answers: { "q-rank": ["a", "b", "c"] },
    };
    const next = quizReducer(state, { type: "NEXT" }, QUESTIONS);
    expect(next.phase).toBe("review");
  });

  it("BACK from step > 0 decrements", () => {
    const state: QuizState = { ...initialQuizState, phase: "step", currentStepIndex: 2 };
    const next = quizReducer(state, { type: "BACK" }, QUESTIONS);
    expect(next.currentStepIndex).toBe(1);
  });

  it("BACK from step 0 stays at step 0 (noop)", () => {
    const state: QuizState = { ...initialQuizState, phase: "step", currentStepIndex: 0 };
    const next = quizReducer(state, { type: "BACK" }, QUESTIONS);
    expect(next).toBe(state);
  });

  it("BACK from review returns to the last step", () => {
    const state: QuizState = { ...initialQuizState, phase: "review", currentStepIndex: 0 };
    const next = quizReducer(state, { type: "BACK" }, QUESTIONS);
    expect(next.phase).toBe("step");
    expect(next.currentStepIndex).toBe(QUESTIONS.length - 1);
  });

  it("GOTO_STEP within bounds switches to step phase", () => {
    const state: QuizState = { ...initialQuizState, phase: "review" };
    const next = quizReducer(state, { type: "GOTO_STEP", index: 3 }, QUESTIONS);
    expect(next.phase).toBe("step");
    expect(next.currentStepIndex).toBe(3);
  });

  it("GOTO_STEP out of bounds is a noop", () => {
    const state: QuizState = { ...initialQuizState, phase: "review" };
    expect(quizReducer(state, { type: "GOTO_STEP", index: -1 }, QUESTIONS)).toBe(state);
    expect(quizReducer(state, { type: "GOTO_STEP", index: QUESTIONS.length }, QUESTIONS)).toBe(state);
  });

  it("RESTART zeroes state to initial", () => {
    const state: QuizState = {
      phase: "review",
      currentStepIndex: 5,
      answers: { "q-single": ["a"] },
      completedProfile: null,
    };
    const next = quizReducer(state, { type: "RESTART" }, QUESTIONS);
    expect(next).toEqual(initialQuizState);
  });

  it("COMPLETE writes profile and moves to completed phase", () => {
    const profile: QuizProfile = {
      version: 1,
      tagScores: { x: 1 },
      answers: [{ questionId: "q-single", answerIds: ["a"] }],
    };
    const state: QuizState = { ...initialQuizState, phase: "review" };
    const next = quizReducer(state, { type: "COMPLETE", profile }, QUESTIONS);
    expect(next.phase).toBe("completed");
    expect(next.completedProfile).toEqual(profile);
  });

  it("START moves intro → step (currentStepIndex = 0)", () => {
    const next = quizReducer(initialQuizState, { type: "START" }, QUESTIONS);
    expect(next.phase).toBe("step");
    expect(next.currentStepIndex).toBe(0);
  });

  it("START is a noop outside intro phase", () => {
    const state: QuizState = { ...initialQuizState, phase: "step", currentStepIndex: 3 };
    const next = quizReducer(state, { type: "START" }, QUESTIONS);
    expect(next).toBe(state);
  });

  it("EDIT_DRAFT_ANSWER stores selection but does NOT change phase", () => {
    const next = quizReducer(
      initialQuizState,
      { type: "EDIT_DRAFT_ANSWER", questionId: "q-single", answerIds: ["a"] },
      QUESTIONS,
    );
    expect(next.phase).toBe("intro");
    expect(next.answers["q-single"]).toEqual(["a"]);
  });

  // Defensive: TS forbids unknown action types at compile time, but the runtime
  // fallback keeps the reducer crash-free if hydration ever feeds it junk.
  it("returns prior state on unknown action (defensive default)", () => {
    const state: QuizState = { ...initialQuizState, phase: "step" };
    // Cast intentional: we can't construct a typed unknown action.
    const next = quizReducer(state, { type: "MYSTERY" } as unknown as Parameters<typeof quizReducer>[1], QUESTIONS);
    expect(next).toBe(state);
  });

});
