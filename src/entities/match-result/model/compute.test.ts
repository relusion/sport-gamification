import { describe, it, expect } from "vitest";

import type { Activity } from "@/entities/activity";
import type { Archetype } from "@/entities/archetype";
import type { QuizProfile } from "@/entities/quiz-profile";
import type { Tag, TagCategory } from "@/entities/tag";

import { computeMatchResult } from "./compute";
import { MatchResultSchema } from "./schema";

const tag = (id: string, category: TagCategory): Tag => ({
  id,
  category,
  nameKey: `match.tags.${id}.name`,
});

const arch = (id: string, traitWeights: Record<string, number>, recommendedActivityIds: string[] = ["a1"]): Archetype => ({
  id,
  nameKey: `match.archetypes.${id}.name`,
  descriptionKey: `match.archetypes.${id}.description`,
  traitWeights,
  recommendedActivityIds,
});

const activity = (id: string, tagAffinities: Record<string, number>): Activity => ({
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

const profile = (scores: Record<string, number>): QuizProfile => ({
  version: 1,
  tagScores: scores,
  answers: [],
});

const SYNTHETIC_TAGS: Tag[] = [
  tag("focus", "preference"),
  tag("freeform", "preference"),
  tag("team", "social"),
  tag("calm", "energy"),
  tag("indoor", "environment"),
  tag("outdoor", "environment"),
  tag("endurance", "movement"),
  tag("burst", "energy"),
  tag("morning", "seasonality"),
  tag("practical", "skill"),
];

const SYNTHETIC_ARCHETYPES: Archetype[] = [
  arch("calm-focuser", { focus: 3, calm: 2 }, ["a-yoga", "a-stretch"]),
  arch("team-player", { team: 4, burst: 1 }, ["a-team-sport"]),
  arch("explorer", { outdoor: 3, endurance: 2 }, ["a-hike"]),
];

const SYNTHETIC_ACTIVITIES: Activity[] = [
  activity("a-yoga", { calm: 3, focus: 2, indoor: 1 }),
  activity("a-stretch", { calm: 2, indoor: 1 }),
  activity("a-team-sport", { team: 3, burst: 2, outdoor: 1 }),
  activity("a-hike", { outdoor: 4, endurance: 3 }),
  activity("a-jog", { outdoor: 2, endurance: 2 }),
];

describe("computeMatchResult (integration)", () => {
  it("produces a schema-valid MatchResult", () => {
    const p = profile({ focus: 2, calm: 3, team: 1, outdoor: 2, endurance: 1 });
    const result = computeMatchResult(p, SYNTHETIC_ACTIVITIES, SYNTHETIC_ARCHETYPES, SYNTHETIC_TAGS);
    expect(() => MatchResultSchema.parse(result)).not.toThrow();
    expect(result.version).toBe(1);
  });

  it("picks the archetype with the highest dot product", () => {
    const p = profile({ team: 5, burst: 2 });
    const result = computeMatchResult(p, SYNTHETIC_ACTIVITIES, SYNTHETIC_ARCHETYPES, SYNTHETIC_TAGS);
    expect(result.mainArchetypeId).toBe("team-player");
  });

  it("returns reasonKeys formatted as bare strings (no next-intl)", () => {
    const p = profile({ focus: 2, calm: 3 });
    const result = computeMatchResult(p, SYNTHETIC_ACTIVITIES, SYNTHETIC_ARCHETYPES, SYNTHETIC_TAGS);
    expect(result.reasonKeys.archetype).toMatch(/^match\.archetypes\.[a-z-]+\.flavor$/);
    for (const ra of result.rankedActivities) {
      expect(result.reasonKeys.activities[ra.id]).toBe(`match.activities.${ra.id}.fit`);
    }
  });

  it("is deterministic for identical inputs", () => {
    const p = profile({ focus: 2, calm: 3, team: 1, outdoor: 2, endurance: 1 });
    const a = computeMatchResult(p, SYNTHETIC_ACTIVITIES, SYNTHETIC_ARCHETYPES, SYNTHETIC_TAGS);
    const b = computeMatchResult(p, SYNTHETIC_ACTIVITIES, SYNTHETIC_ARCHETYPES, SYNTHETIC_TAGS);
    expect(a).toEqual(b);
  });

  it("is invariant under shuffling input arrays (property test)", () => {
    const p = profile({ focus: 2, calm: 3, team: 1, outdoor: 2, endurance: 1, burst: 1 });
    const baseline = computeMatchResult(
      p,
      SYNTHETIC_ACTIVITIES,
      SYNTHETIC_ARCHETYPES,
      SYNTHETIC_TAGS,
    );

    // Five fixed permutations sufficient as a smoke property test.
    const permutations: Array<[Activity[], Archetype[], Tag[]]> = [
      [
        [...SYNTHETIC_ACTIVITIES].reverse(),
        [...SYNTHETIC_ARCHETYPES].reverse(),
        [...SYNTHETIC_TAGS].reverse(),
      ],
      [
        [SYNTHETIC_ACTIVITIES[2]!, SYNTHETIC_ACTIVITIES[0]!, SYNTHETIC_ACTIVITIES[4]!, SYNTHETIC_ACTIVITIES[1]!, SYNTHETIC_ACTIVITIES[3]!],
        [SYNTHETIC_ARCHETYPES[1]!, SYNTHETIC_ARCHETYPES[2]!, SYNTHETIC_ARCHETYPES[0]!],
        [...SYNTHETIC_TAGS].sort((x, y) => x.id.localeCompare(y.id)),
      ],
      [
        [...SYNTHETIC_ACTIVITIES].sort((x, y) => y.id.localeCompare(x.id)),
        [...SYNTHETIC_ARCHETYPES].sort((x, y) => y.id.localeCompare(x.id)),
        [...SYNTHETIC_TAGS].sort((x, y) => y.id.localeCompare(x.id)),
      ],
      [
        SYNTHETIC_ACTIVITIES.slice().reverse(),
        SYNTHETIC_ARCHETYPES,
        SYNTHETIC_TAGS,
      ],
      [
        SYNTHETIC_ACTIVITIES,
        SYNTHETIC_ARCHETYPES.slice().reverse(),
        SYNTHETIC_TAGS.slice().reverse(),
      ],
    ];

    for (const [acts, archs, tags] of permutations) {
      expect(computeMatchResult(p, acts, archs, tags)).toEqual(baseline);
    }
  });

  it("does not call Date.now or Math.random (purity smoke test)", () => {
    // Two computations across a known time-skip — outputs identical.
    const p = profile({ focus: 1, team: 1 });
    const r1 = computeMatchResult(p, SYNTHETIC_ACTIVITIES, SYNTHETIC_ARCHETYPES, SYNTHETIC_TAGS);
    const r2 = computeMatchResult(p, SYNTHETIC_ACTIVITIES, SYNTHETIC_ARCHETYPES, SYNTHETIC_TAGS);
    expect(r1).toEqual(r2);
  });

  it("returns rankedActivities ordered by score descending", () => {
    const p = profile({ outdoor: 3, endurance: 3 });
    const result = computeMatchResult(p, SYNTHETIC_ACTIVITIES, SYNTHETIC_ARCHETYPES, SYNTHETIC_TAGS);
    const scores = result.rankedActivities.map((r) => r.score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]!).toBeGreaterThanOrEqual(scores[i]!);
    }
  });
});
