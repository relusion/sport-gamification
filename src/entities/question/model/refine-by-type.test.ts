import { describe, it, expect } from "vitest";

import { QuizQuestionSchema } from "./schema";

const baseAnswer = {
  id: "a-1",
  labelKey: "quiz.q.a1.label",
  tagWeights: { calm: 0.5 },
};

function makeAnswers(count: number) {
  return Array.from({ length: count }, (_, i) => ({ ...baseAnswer, id: `a-${i + 1}` }));
}

const baseQuestion = {
  id: "q-1",
  area: "social",
  promptKey: "quiz.q.prompt",
};

describe("refineByType — would-you-rather", () => {
  it("rejects exactly 1 answer", () => {
    const result = QuizQuestionSchema.safeParse({
      ...baseQuestion,
      type: "would-you-rather",
      answers: makeAnswers(1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 2 answers", () => {
    const result = QuizQuestionSchema.safeParse({
      ...baseQuestion,
      type: "would-you-rather",
      answers: makeAnswers(2),
    });
    expect(result.success).toBe(true);
  });

  it("rejects 3 answers with a path-pointed error", () => {
    const result = QuizQuestionSchema.safeParse({
      ...baseQuestion,
      type: "would-you-rather",
      answers: makeAnswers(3),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const wyrIssue = result.error.issues.find((i) => i.path.includes("answers"));
      expect(wyrIssue, "expected an error pointing at answers").toBeDefined();
      expect(wyrIssue!.message).toMatch(/exactly 2/i);
    }
  });
});

describe("refineByType — slider", () => {
  it("rejects 2 stops (under min)", () => {
    const result = QuizQuestionSchema.safeParse({
      ...baseQuestion,
      type: "slider",
      answers: makeAnswers(2),
    });
    // min(2) at the array level passes, but slider-specific rule requires >= 3
    expect(result.success).toBe(false);
    if (!result.success) {
      const sliderIssue = result.error.issues.find((i) => i.path.includes("answers"));
      expect(sliderIssue!.message).toMatch(/3.*7/);
    }
  });

  it("accepts 3 stops (lower bound)", () => {
    const result = QuizQuestionSchema.safeParse({
      ...baseQuestion,
      type: "slider",
      answers: makeAnswers(3),
    });
    expect(result.success).toBe(true);
  });

  it("accepts 7 stops (upper bound)", () => {
    const result = QuizQuestionSchema.safeParse({
      ...baseQuestion,
      type: "slider",
      answers: makeAnswers(7),
    });
    expect(result.success).toBe(true);
  });

  it("rejects 8 stops (over max)", () => {
    const result = QuizQuestionSchema.safeParse({
      ...baseQuestion,
      type: "slider",
      answers: makeAnswers(8),
    });
    expect(result.success).toBe(false);
  });
});

describe("refineByType — single / multi / visual / ranking", () => {
  it("rejects 1 answer (existing min(2) preserved)", () => {
    for (const type of ["single", "multi", "visual", "ranking"] as const) {
      const result = QuizQuestionSchema.safeParse({
        ...baseQuestion,
        type,
        answers: makeAnswers(1),
      });
      expect(result.success, `${type} should reject 1 answer`).toBe(false);
    }
  });

  it("accepts 2 or more answers", () => {
    for (const type of ["single", "multi", "visual", "ranking"] as const) {
      for (const count of [2, 3, 5, 12]) {
        const result = QuizQuestionSchema.safeParse({
          ...baseQuestion,
          type,
          answers: makeAnswers(count),
        });
        expect(result.success, `${type} with ${count} answers`).toBe(true);
      }
    }
  });
});
