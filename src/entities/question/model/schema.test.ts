import { describe, it, expect } from "vitest";

import { QuizQuestionSchema } from "./schema";

const baseAnswer = {
  id: "a-1",
  labelKey: "quiz.q1.a1.label",
  tagWeights: { calm: 0.5 },
};

const validQuestion = {
  id: "q-1",
  type: "single",
  area: "social",
  promptKey: "quiz.q1.prompt",
  answers: [baseAnswer, { ...baseAnswer, id: "a-2" }],
};

describe("QuizQuestionSchema", () => {
  it("accepts a valid single-choice question with at least two answers", () => {
    expect(() => QuizQuestionSchema.parse(validQuestion)).not.toThrow();
  });

  it("accepts every supported question type", () => {
    // refineByType (constraint #38) imposes type-specific answer-count rules,
    // so each type uses an answer count that satisfies its own bound.
    const cases = [
      { type: "single", count: 2 },
      { type: "multi", count: 2 },
      { type: "slider", count: 5 },
      { type: "ranking", count: 4 },
      { type: "would-you-rather", count: 2 },
      { type: "visual", count: 3 },
    ] as const;
    for (const { type, count } of cases) {
      const answers = Array.from({ length: count }, (_, i) => ({
        ...baseAnswer,
        id: `a-${i + 1}`,
      }));
      expect(() => QuizQuestionSchema.parse({ ...validQuestion, type, answers })).not.toThrow();
    }
  });

  it("rejects an unknown question type", () => {
    const bad = { ...validQuestion, type: "essay" };
    const result = QuizQuestionSchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("type");
    }
  });

  it("requires at least two answers", () => {
    const bad = { ...validQuestion, answers: [baseAnswer] };
    expect(QuizQuestionSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts an optional subtitleKey", () => {
    expect(() =>
      QuizQuestionSchema.parse({ ...validQuestion, subtitleKey: "quiz.q1.subtitle" }),
    ).not.toThrow();
  });
});
