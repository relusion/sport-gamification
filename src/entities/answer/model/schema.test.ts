import { describe, it, expect } from "vitest";

import { QuizAnswerSchema } from "./schema";

describe("QuizAnswerSchema", () => {
  const valid = {
    id: "answer-team-1",
    labelKey: "quiz.q1.a1.label",
    tagWeights: { teamOriented: 1.2 },
  };

  it("accepts a valid answer", () => {
    expect(() => QuizAnswerSchema.parse(valid)).not.toThrow();
  });

  it("accepts an optional hintKey", () => {
    expect(() => QuizAnswerSchema.parse({ ...valid, hintKey: "quiz.q1.a1.hint" })).not.toThrow();
  });

  it("rejects when tagWeights values are not numbers", () => {
    const bad = { ...valid, tagWeights: { teamOriented: "yes" } };
    expect(QuizAnswerSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an empty labelKey", () => {
    const bad = { ...valid, labelKey: "" };
    expect(QuizAnswerSchema.safeParse(bad).success).toBe(false);
  });
});
