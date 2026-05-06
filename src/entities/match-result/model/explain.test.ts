import { describe, it, expect } from "vitest";

import type { Activity } from "@/entities/activity";
import type { QuizProfile } from "@/entities/quiz-profile";

import { activityReasonKey, archetypeReasonKey, deriveTopTags } from "./explain";

const profile = (scores: Record<string, number>): QuizProfile => ({
  version: 1,
  tagScores: scores,
  answers: [],
});

const activity = (tagAffinities: Record<string, number>): Activity => ({
  id: "test",
  ageRange: { min: 6, max: 12 },
  socialMode: ["solo"],
  energy: ["medium"],
  environment: ["indoor"],
  movementSkills: ["balance"],
  contactLevel: "none",
  costLevel: "low",
  equipmentLevel: "minimal",
  beginnerFriendliness: "high",
  seasonality: ["all"],
  nameKey: "match.activities.test.name",
  descriptionKey: "match.activities.test.description",
  tagAffinities,
});

describe("deriveTopTags", () => {
  it("returns top 3 by descending contribution", () => {
    const p = profile({ a: 3, b: 4, c: 2, d: 5, e: 1 });
    const a = activity({ a: 1, b: 1, c: 1, d: 1, e: 1 });
    // contributions: a=3, b=4, c=2, d=5, e=1 → top3 = [d, b, a]
    expect(deriveTopTags(p, a)).toEqual(["d", "b", "a"]);
  });

  it("breaks contribution ties via ascending tag id", () => {
    const p = profile({ z: 2, a: 2, m: 2 });
    const a = activity({ z: 1, a: 1, m: 1 });
    // all contribute 2 → ascending id → [a, m, z]
    expect(deriveTopTags(p, a)).toEqual(["a", "m", "z"]);
  });

  it("returns fewer than 3 when activity has fewer affinity entries", () => {
    const p = profile({ x: 5, y: 5 });
    const a = activity({ x: 1 });
    expect(deriveTopTags(p, a)).toEqual(["x"]);
  });

  it("excludes tags whose contribution is exactly 0 (missing on profile)", () => {
    const p = profile({ x: 5 });
    const a = activity({ x: 1, y: 1, z: 1 });
    // y, z contribute 0 (missing from profile) → only x
    expect(deriveTopTags(p, a)).toEqual(["x"]);
  });

  it("returns empty array when no overlap", () => {
    const p = profile({ q: 1 });
    const a = activity({ x: 1 });
    expect(deriveTopTags(p, a)).toEqual([]);
  });

  it("caps at exactly 3", () => {
    const p = profile({ a: 5, b: 4, c: 3, d: 2, e: 1 });
    const a = activity({ a: 1, b: 1, c: 1, d: 1, e: 1 });
    const result = deriveTopTags(p, a);
    expect(result).toHaveLength(3);
    expect(result).toEqual(["a", "b", "c"]);
  });
});

describe("reason key formatting", () => {
  it("formats archetypeReasonKey as 'match.archetypes.<id>.flavor'", () => {
    expect(archetypeReasonKey("fast-team-explorer")).toBe(
      "match.archetypes.fast-team-explorer.flavor",
    );
  });

  it("formats activityReasonKey as 'match.activities.<id>.fit'", () => {
    expect(activityReasonKey("basketball")).toBe("match.activities.basketball.fit");
  });
});
