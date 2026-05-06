import { describe, it, expect } from "vitest";

import { QuizProfileSchema } from "./schema";

const validProfile = {
  version: 1,
  tagScores: { calm: 1.5, social: 0.25 },
  answers: [
    { questionId: "q-1", answerIds: ["a-1"] },
    { questionId: "q-2", answerIds: ["a-3", "a-4"] },
  ],
};

describe("QuizProfileSchema", () => {
  it("accepts a valid profile", () => {
    expect(() => QuizProfileSchema.parse(validProfile)).not.toThrow();
  });

  it("accepts an optional ISO-8601 completedAt", () => {
    expect(() =>
      QuizProfileSchema.parse({ ...validProfile, completedAt: "2026-05-05T17:00:00Z" }),
    ).not.toThrow();
  });

  it("rejects a non-ISO completedAt string", () => {
    const result = QuizProfileSchema.safeParse({
      ...validProfile,
      completedAt: "yesterday",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing version", () => {
    const { version: _v, ...withoutVersion } = validProfile;
    expect(QuizProfileSchema.safeParse(withoutVersion).success).toBe(false);
  });

  it("rejects version drift (version: 2)", () => {
    expect(QuizProfileSchema.safeParse({ ...validProfile, version: 2 }).success).toBe(false);
  });

  it("rejects negative tag scores", () => {
    const result = QuizProfileSchema.safeParse({
      ...validProfile,
      tagScores: { calm: -1 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-finite tag scores", () => {
    const result = QuizProfileSchema.safeParse({
      ...validProfile,
      tagScores: { calm: Number.POSITIVE_INFINITY },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty-string tag id keys", () => {
    const result = QuizProfileSchema.safeParse({
      ...validProfile,
      tagScores: { "": 1 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing answers array", () => {
    const { answers: _a, ...withoutAnswers } = validProfile;
    expect(QuizProfileSchema.safeParse(withoutAnswers).success).toBe(false);
  });

  it("rejects empty-string questionId", () => {
    const result = QuizProfileSchema.safeParse({
      ...validProfile,
      answers: [{ questionId: "", answerIds: ["a-1"] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty-string answerId", () => {
    const result = QuizProfileSchema.safeParse({
      ...validProfile,
      answers: [{ questionId: "q-1", answerIds: [""] }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an empty tagScores object (no committed weights yet)", () => {
    expect(() =>
      QuizProfileSchema.parse({ ...validProfile, tagScores: {} }),
    ).not.toThrow();
  });

  it("accepts an empty answers array (defensive: still schema-shaped)", () => {
    expect(() =>
      QuizProfileSchema.parse({ ...validProfile, answers: [] }),
    ).not.toThrow();
  });
});
