import { describe, it, expect } from "vitest";

import type { Activity } from "@/entities/activity";
import type { QuizProfile } from "@/entities/quiz-profile";
import type { Tag, TagCategory } from "@/entities/tag";

import { rankActivities } from "./rank-activities";
import { TOP_ACTIVITY_COUNT } from "./constants";

const baseActivity = (
  id: string,
  tagAffinities: Record<string, number>,
): Activity => ({
  id,
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
  nameKey: `match.activities.${id}.name`,
  descriptionKey: `match.activities.${id}.description`,
  tagAffinities,
});

const tag = (id: string, category: TagCategory): Tag => ({
  id,
  category,
  nameKey: `match.tags.${id}.name`,
});

const profile = (scores: Record<string, number>): QuizProfile => ({
  version: 1,
  tagScores: scores,
  answers: [],
});

function buildTagsByCategory(tags: Tag[]): Record<TagCategory, readonly Tag[]> {
  const acc: Record<TagCategory, Tag[]> = {
    social: [],
    energy: [],
    environment: [],
    movement: [],
    contact: [],
    cost: [],
    equipment: [],
    seasonality: [],
    skill: [],
    preference: [],
  };
  for (const t of tags) acc[t.category].push(t);
  return acc;
}

describe("rankActivities", () => {
  it("sorts by total score descending", () => {
    const tagsByCategory = buildTagsByCategory([
      tag("focus", "preference"),
      tag("team", "social"),
    ]);
    const activities: Activity[] = [
      baseActivity("low", { focus: 1 }), // 2
      baseActivity("high", { focus: 5, team: 2 }), // 10 + 4 = 14
      baseActivity("mid", { team: 3 }), // 6
    ];
    const ranked = rankActivities(profile({ focus: 2, team: 2 }), activities, tagsByCategory);
    expect(ranked.map((r) => r.id)).toEqual(["high", "mid", "low"]);
  });

  it("breaks ties on equal score via ascending id (lexicographic)", () => {
    const tagsByCategory = buildTagsByCategory([tag("focus", "preference")]);
    const activities: Activity[] = [
      baseActivity("zebra", { focus: 1 }),
      baseActivity("apple", { focus: 1 }),
      baseActivity("mango", { focus: 1 }),
    ];
    const ranked = rankActivities(profile({ focus: 5 }), activities, tagsByCategory);
    expect(ranked.map((r) => r.id)).toEqual(["apple", "mango", "zebra"]);
  });

  it("returns at most TOP_ACTIVITY_COUNT entries", () => {
    const tagsByCategory = buildTagsByCategory([tag("focus", "preference")]);
    const activities: Activity[] = Array.from({ length: 12 }, (_, i) =>
      baseActivity(`a-${String(i).padStart(2, "0")}`, { focus: i + 1 }),
    );
    const ranked = rankActivities(profile({ focus: 1 }), activities, tagsByCategory);
    expect(ranked).toHaveLength(TOP_ACTIVITY_COUNT);
  });

  it("populates componentBreakdown with all 5 component keys", () => {
    const tagsByCategory = buildTagsByCategory([tag("focus", "preference")]);
    const activities = [baseActivity("only", { focus: 1 })];
    const ranked = rankActivities(profile({ focus: 1 }), activities, tagsByCategory);
    expect(ranked).toHaveLength(1);
    const keys = Object.keys(ranked[0]!.componentBreakdown).sort();
    expect(keys).toEqual([
      "confidence_fit",
      "environment_fit",
      "practical_fit",
      "preference_fit",
      "social_fit",
    ]);
  });

  it("score equals the sum of componentBreakdown", () => {
    const tagsByCategory = buildTagsByCategory([
      tag("focus", "preference"),
      tag("team", "social"),
    ]);
    const activities = [baseActivity("a", { focus: 2, team: 3 })];
    const ranked = rankActivities(profile({ focus: 1, team: 4 }), activities, tagsByCategory);
    const r = ranked[0]!;
    const sum = Object.values(r.componentBreakdown).reduce((s, x) => s + x, 0);
    expect(r.score).toBeCloseTo(sum);
  });

  it("returns empty array on empty activity list", () => {
    const ranked = rankActivities(profile({}), [], buildTagsByCategory([]));
    expect(ranked).toEqual([]);
  });
});
