import { describe, it, expect } from "vitest";

import type { Archetype } from "@/entities/archetype";
import type { Tag } from "@/entities/tag";
import type { QuizProfile } from "@/entities/quiz-profile";

import { deriveWhyTags } from "./derive-why-tags";

function archetype(traitWeights: Record<string, number>): Archetype {
  return {
    id: "test-archetype",
    nameKey: "k",
    descriptionKey: "d",
    traitWeights,
    recommendedActivityIds: ["yoga"],
  };
}

function profile(tagScores: Record<string, number>): QuizProfile {
  return { version: 1, tagScores, answers: [] };
}

function tag(id: string, category: Tag["category"] = "social"): Tag {
  return { id, category, nameKey: `match.tags.${id}.name` };
}

describe("deriveWhyTags", () => {
  it("returns at most 3 tag ids, sorted by descending contribution", () => {
    const a = archetype({ social: 2, team: 3, energy: 1, focus: 4, indoor: 1 });
    const p = profile({ social: 2, team: 1, energy: 5, focus: 1, indoor: 3 });
    const tags = ["social", "team", "energy", "focus", "indoor"].map((id) => tag(id));
    const out = deriveWhyTags(p, a, tags);
    // contributions:
    //   social: 2*2=4, team: 3*1=3, energy: 1*5=5, focus: 4*1=4, indoor: 1*3=3
    // sorted desc: energy(5), focus(4), social(4), team(3), indoor(3)
    // ties at 4 (focus, social) → ascending id → focus, social
    expect(out).toEqual(["energy", "focus", "social"]);
  });

  it("breaks ties by ascending tag id", () => {
    const a = archetype({ alpha: 2, bravo: 2, charlie: 2 });
    const p = profile({ alpha: 1, bravo: 1, charlie: 1 });
    const tags = ["alpha", "bravo", "charlie"].map((id) => tag(id));
    const out = deriveWhyTags(p, a, tags);
    expect(out).toEqual(["alpha", "bravo", "charlie"]);
  });

  it("treats missing profile scores as 0 (tags sink to bottom)", () => {
    const a = archetype({ first: 5, second: 4, third: 3, fourth: 2 });
    const p = profile({ first: 1 });
    const tags = ["first", "second", "third", "fourth"].map((id) => tag(id));
    const out = deriveWhyTags(p, a, tags);
    // first:5, others 0; ties broken by ascending id → first, fourth, second
    expect(out).toEqual(["first", "fourth", "second"]);
  });

  it("returns an empty array when every contribution is zero", () => {
    const a = archetype({ x: 1, y: 1 });
    const p = profile({});
    const tags = [tag("x"), tag("y")];
    const out = deriveWhyTags(p, a, tags);
    expect(out).toEqual([]);
  });

  it("is deterministic — same inputs produce identical output", () => {
    const a = archetype({ social: 2, team: 3, energy: 1 });
    const p = profile({ social: 1, team: 2, energy: 3 });
    const tags = [tag("social"), tag("team"), tag("energy")];
    const a1 = deriveWhyTags(p, a, tags);
    const a2 = deriveWhyTags(p, a, tags);
    expect(a1).toEqual(a2);
  });

  it("returns ≤ 3 entries even when many tags contribute positively", () => {
    const a = archetype({ a: 1, b: 1, c: 1, d: 1, e: 1 });
    const p = profile({ a: 1, b: 1, c: 1, d: 1, e: 1 });
    const tags = ["a", "b", "c", "d", "e"].map((id) => tag(id));
    const out = deriveWhyTags(p, a, tags);
    expect(out.length).toBe(3);
  });
});
