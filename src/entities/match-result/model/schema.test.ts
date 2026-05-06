import { describe, it, expect } from "vitest";

import { MatchResultSchema, type MatchResult } from "./schema";

const validMatchResult: MatchResult = {
  version: 1,
  mainArchetypeId: "fast-team-explorer",
  secondaryArchetypeIds: ["power-builder"],
  rankedActivities: [
    {
      id: "basketball",
      score: 6.5,
      componentBreakdown: {
        preference_fit: 1.5,
        environment_fit: 1.0,
        social_fit: 2.0,
        confidence_fit: 1.5,
        practical_fit: 0.5,
      },
      topTags: ["team", "energy", "indoor"],
    },
  ],
  reasonKeys: {
    archetype: "match.archetypes.fast-team-explorer.flavor",
    activities: { basketball: "match.activities.basketball.fit" },
  },
};

describe("MatchResultSchema", () => {
  it("parses a hand-crafted valid object", () => {
    const parsed = MatchResultSchema.parse(validMatchResult);
    expect(parsed).toEqual(validMatchResult);
  });

  it("rejects a missing version", () => {
    const { version: _v, ...rest } = validMatchResult;
    const result = MatchResultSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects a non-1 version (forward-compat literal)", () => {
    const result = MatchResultSchema.safeParse({ ...validMatchResult, version: 2 });
    expect(result.success).toBe(false);
  });

  it("rejects an oversized topTags (>3)", () => {
    const result = MatchResultSchema.safeParse({
      ...validMatchResult,
      rankedActivities: [
        {
          ...validMatchResult.rankedActivities[0],
          topTags: ["team", "energy", "indoor", "burst"],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a componentBreakdown missing a component key", () => {
    const result = MatchResultSchema.safeParse({
      ...validMatchResult,
      rankedActivities: [
        {
          ...validMatchResult.rankedActivities[0],
          componentBreakdown: {
            preference_fit: 1.5,
            environment_fit: 1.0,
            social_fit: 2.0,
            confidence_fit: 1.5,
            // practical_fit missing
          },
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero secondaries (no near-floor archetype)", () => {
    const parsed = MatchResultSchema.parse({
      ...validMatchResult,
      secondaryArchetypeIds: [],
    });
    expect(parsed.secondaryArchetypeIds).toEqual([]);
  });

  it("accepts empty topTags (degenerate single-tag activity)", () => {
    const parsed = MatchResultSchema.parse({
      ...validMatchResult,
      rankedActivities: [
        {
          ...validMatchResult.rankedActivities[0],
          topTags: [],
        },
      ],
    });
    expect(parsed.rankedActivities[0]?.topTags).toEqual([]);
  });
});
