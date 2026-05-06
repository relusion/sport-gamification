import { describe, it, expect } from "vitest";

import type { QuizQuestion } from "@/entities/question";

import { buildProfile } from "./build";
import { QuizProfileSchema } from "./schema";

const singleQuestion: QuizQuestion = {
  id: "q-single",
  type: "single",
  area: "social",
  promptKey: "quiz.q-single.prompt",
  answers: [
    { id: "alone", labelKey: "k.alone", tagWeights: { calm: 2, focus: 1 } },
    { id: "duo", labelKey: "k.duo", tagWeights: { social: 2 } },
  ],
};

const multiQuestion: QuizQuestion = {
  id: "q-multi",
  type: "multi",
  area: "movement",
  promptKey: "quiz.q-multi.prompt",
  answers: [
    { id: "trail", labelKey: "k.trail", tagWeights: { outdoor: 1, endurance: 0.5 } },
    { id: "studio", labelKey: "k.studio", tagWeights: { indoor: 1, focus: 0.5 } },
    { id: "court", labelKey: "k.court", tagWeights: { team: 1 } },
  ],
};

const rankingQuestion: QuizQuestion = {
  id: "q-ranking",
  type: "ranking",
  area: "preference",
  promptKey: "quiz.q-ranking.prompt",
  // Pre-authored per-position weights — buildProfile does not invent ranking
  // contribution; whichever answerId the consumer commits at position N is
  // expected to carry the per-position weight already.
  answers: [
    { id: "speed", labelKey: "k.speed", tagWeights: { fast: 3 } },
    { id: "skill", labelKey: "k.skill", tagWeights: { precision: 3 } },
    { id: "endurance", labelKey: "k.endurance", tagWeights: { stamina: 2 } },
    { id: "creativity", labelKey: "k.creativity", tagWeights: { expression: 1 } },
  ],
};

describe("buildProfile", () => {
  it("scores a single-select answer", () => {
    const profile = buildProfile(
      [singleQuestion],
      [{ questionId: "q-single", answerIds: ["alone"] }],
    );
    expect(profile.tagScores).toEqual({ calm: 2, focus: 1 });
    expect(profile.answers).toEqual([{ questionId: "q-single", answerIds: ["alone"] }]);
    expect(profile.version).toBe(1);
  });

  it("sums weights across multi-select answers within a step", () => {
    const profile = buildProfile(
      [multiQuestion],
      [{ questionId: "q-multi", answerIds: ["trail", "studio"] }],
    );
    expect(profile.tagScores).toEqual({
      outdoor: 1,
      endurance: 0.5,
      indoor: 1,
      focus: 0.5,
    });
  });

  it("aggregates pre-authored ranking weights across all selected positions", () => {
    const profile = buildProfile(
      [rankingQuestion],
      [{ questionId: "q-ranking", answerIds: ["speed", "skill", "endurance", "creativity"] }],
    );
    expect(profile.tagScores).toEqual({
      fast: 3,
      precision: 3,
      stamina: 2,
      expression: 1,
    });
  });

  it("aggregates across multiple questions", () => {
    const profile = buildProfile(
      [singleQuestion, multiQuestion],
      [
        { questionId: "q-single", answerIds: ["duo"] },
        { questionId: "q-multi", answerIds: ["court"] },
      ],
    );
    expect(profile.tagScores).toEqual({ social: 2, team: 1 });
  });

  it("ignores answers whose questionId is unknown (defensive)", () => {
    const profile = buildProfile(
      [singleQuestion],
      [
        { questionId: "q-single", answerIds: ["alone"] },
        { questionId: "q-ghost", answerIds: ["never"] },
      ],
    );
    expect(profile.tagScores).toEqual({ calm: 2, focus: 1 });
  });

  it("ignores answerIds the question does not declare", () => {
    const profile = buildProfile(
      [singleQuestion],
      [{ questionId: "q-single", answerIds: ["alone", "nonexistent"] }],
    );
    expect(profile.tagScores).toEqual({ calm: 2, focus: 1 });
  });

  it("clamps negative cumulative scores at 0 (forward-compatible defence)", () => {
    const wired: QuizQuestion = {
      ...singleQuestion,
      id: "q-clamp",
      // Type assertion is intentional: the entity schema currently rejects
      // negative weights at parse time (#22 — non-zero, not non-negative
      // strictly), so we craft a runtime-only fixture to exercise the clamp
      // path. The branch must stay dead in normal flow but loud-fail safe if
      // future authoring ever introduces negatives.
      answers: [
        { id: "neg", labelKey: "k.neg", tagWeights: { dark: -5 } as Record<string, number> },
      ],
    };
    const profile = buildProfile(
      [wired],
      [{ questionId: "q-clamp", answerIds: ["neg"] }],
    );
    expect(profile.tagScores.dark).toBe(0);
  });

  it("returns a schema-valid QuizProfile (round-trip)", () => {
    const profile = buildProfile(
      [singleQuestion, multiQuestion],
      [
        { questionId: "q-single", answerIds: ["duo"] },
        { questionId: "q-multi", answerIds: ["trail", "court"] },
      ],
    );
    const parsed = QuizProfileSchema.parse(profile);
    expect(parsed).toEqual(profile);
  });

  it("is deterministic given identical inputs", () => {
    const a = buildProfile(
      [multiQuestion],
      [{ questionId: "q-multi", answerIds: ["trail", "studio", "court"] }],
    );
    const b = buildProfile(
      [multiQuestion],
      [{ questionId: "q-multi", answerIds: ["trail", "studio", "court"] }],
    );
    expect(a).toEqual(b);
  });

  it("returns an empty tagScores map when no answers committed", () => {
    const profile = buildProfile([singleQuestion], []);
    expect(profile.tagScores).toEqual({});
    expect(profile.answers).toEqual([]);
  });
});
