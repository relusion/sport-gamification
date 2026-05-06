import { describe, it, expect } from "vitest";

import { ArchetypeSchema } from "./schema";

describe("ArchetypeSchema", () => {
  const valid = {
    id: "rhythm-finder",
    nameKey: "archetype.rhythmFinder.name",
    descriptionKey: "archetype.rhythmFinder.description",
    traitWeights: { coordinated: 1.5, social: 0.8 },
    recommendedActivityIds: ["calm-flow", "rhythmic-strike"],
  };

  it("accepts a valid archetype", () => {
    expect(() => ArchetypeSchema.parse(valid)).not.toThrow();
  });

  it("requires at least one recommended activity id", () => {
    const bad = { ...valid, recommendedActivityIds: [] };
    expect(ArchetypeSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects non-numeric trait weights", () => {
    const bad = { ...valid, traitWeights: { coordinated: "high" } };
    expect(ArchetypeSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an empty id", () => {
    const bad = { ...valid, id: "" };
    expect(ArchetypeSchema.safeParse(bad).success).toBe(false);
  });
});
