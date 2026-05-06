import { describe, it, expect } from "vitest";

import type { Archetype } from "@/entities/archetype";
import type { Tag } from "@/entities/tag";
import { ComponentNameSchema } from "@/entities/match-result";

import { deriveTraitBars } from "./derive-trait-bars";

const FIXED_ORDER = [
  "preference_fit",
  "environment_fit",
  "social_fit",
  "confidence_fit",
  "practical_fit",
] as const;

function tag(id: string, category: Tag["category"]): Tag {
  return { id, category, nameKey: `match.tags.${id}.name` };
}

function archetype(traitWeights: Record<string, number>): Archetype {
  return {
    id: "test-archetype",
    nameKey: "match.archetypes.test-archetype.name",
    descriptionKey: "match.archetypes.test-archetype.description",
    traitWeights,
    recommendedActivityIds: ["yoga"],
  };
}

describe("deriveTraitBars", () => {
  it("returns exactly five bars in fixed ComponentName order", () => {
    const bars = deriveTraitBars(archetype({ social: 1, energy: 1 }), [
      tag("social", "social"),
      tag("energy", "energy"),
    ]);
    expect(bars.map((b) => b.component)).toEqual(FIXED_ORDER);
    expect(ComponentNameSchema.options).toEqual(FIXED_ORDER);
  });

  it("normalizes the largest bucket to 1.0 and others 0..1 relative to it", () => {
    const tags: Tag[] = [
      tag("social", "social"),
      tag("team", "social"),
      tag("indoor", "environment"),
      tag("calm", "energy"),
    ];
    const a = archetype({ social: 4, team: 4, indoor: 2, calm: 1 });
    const bars = deriveTraitBars(a, tags);
    const lookup = Object.fromEntries(bars.map((b) => [b.component, b.weight]));
    expect(lookup.social_fit).toBeCloseTo(1, 12);
    expect(lookup.environment_fit).toBeCloseTo(2 / 8, 12);
    expect(lookup.confidence_fit).toBeCloseTo(1 / 8, 12);
    expect(lookup.preference_fit).toBe(0);
    expect(lookup.practical_fit).toBe(0);
  });

  it("yields a single 1.0 bucket when every weight falls into one ComponentName", () => {
    const tags: Tag[] = [
      tag("focus", "preference"),
      tag("freeform", "preference"),
      tag("balance", "movement"),
    ];
    const a = archetype({ focus: 3, freeform: 2 });
    const bars = deriveTraitBars(a, tags);
    const lookup = Object.fromEntries(bars.map((b) => [b.component, b.weight]));
    expect(lookup.preference_fit).toBe(1);
    expect(lookup.environment_fit).toBe(0);
    expect(lookup.social_fit).toBe(0);
    expect(lookup.confidence_fit).toBe(0);
    expect(lookup.practical_fit).toBe(0);
  });

  it("returns zeros for every bar when the archetype's tags are absent from the catalogue", () => {
    const a = archetype({ ghostTag1: 5, ghostTag2: 3 });
    const bars = deriveTraitBars(a, []);
    expect(bars.map((b) => b.weight)).toEqual([0, 0, 0, 0, 0]);
    expect(bars.map((b) => b.component)).toEqual(FIXED_ORDER);
  });

  it("drops tags absent from the catalogue silently while keeping known tags", () => {
    const tags: Tag[] = [tag("social", "social")];
    const a = archetype({ social: 2, ghostTag: 100 });
    const bars = deriveTraitBars(a, tags);
    const lookup = Object.fromEntries(bars.map((b) => [b.component, b.weight]));
    expect(lookup.social_fit).toBe(1);
    expect(lookup.preference_fit).toBe(0);
  });
});
