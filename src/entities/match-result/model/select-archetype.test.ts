import { describe, it, expect } from "vitest";

import type { Archetype } from "@/entities/archetype";
import type { QuizProfile } from "@/entities/quiz-profile";

import { selectArchetypes } from "./select-archetype";

const arch = (id: string, weights: Record<string, number>): Archetype => ({
  id,
  nameKey: `match.archetypes.${id}.name`,
  descriptionKey: `match.archetypes.${id}.description`,
  traitWeights: weights,
  recommendedActivityIds: ["any-activity"],
});

const profile = (scores: Record<string, number>): QuizProfile => ({
  version: 1,
  tagScores: scores,
  answers: [],
});

describe("selectArchetypes", () => {
  it("picks the highest-dot-product archetype as main", () => {
    const archetypes = [
      arch("alpha", { team: 1 }),
      arch("beta", { calm: 1 }),
      arch("gamma", { burst: 1 }),
    ];
    // alpha: 5*1 = 5; beta: 1*1 = 1; gamma: 0 (no burst score)
    const result = selectArchetypes(profile({ team: 5, calm: 1 }), archetypes);
    expect(result.mainArchetypeId).toBe("alpha");
  });

  it("returns one floor-passing secondary when present", () => {
    // main score = 10; near = 0.75*10 = 7.5; floor = 0.50*10 = 5
    const archetypes = [
      arch("main", { x: 10 }), // 10
      arch("close", { x: 8 }), // 8 ≥ 7.5 ✓ ≥ 5 ✓
      arch("floored", { x: 4 }), // 4 < 5  ✗
    ];
    const result = selectArchetypes(profile({ x: 1 }), archetypes);
    expect(result.mainArchetypeId).toBe("main");
    expect(result.secondaryArchetypeIds).toEqual(["close"]);
  });

  it("returns zero secondaries when no archetype passes the floor", () => {
    const archetypes = [
      arch("main", { x: 10 }), // 10
      arch("a", { x: 4 }), // 4 < 5
      arch("b", { x: 3 }),
    ];
    const result = selectArchetypes(profile({ x: 1 }), archetypes);
    expect(result.mainArchetypeId).toBe("main");
    expect(result.secondaryArchetypeIds).toEqual([]);
  });

  it("respects MAX_SECONDARIES (caps at 2)", () => {
    const archetypes = [
      arch("main", { x: 10 }),
      arch("c", { x: 9 }),
      arch("a", { x: 9 }),
      arch("b", { x: 9 }),
    ];
    const result = selectArchetypes(profile({ x: 1 }), archetypes);
    expect(result.mainArchetypeId).toBe("main");
    // tied 9s: ascending id ⇒ a, b, c → cap 2 → [a, b]
    expect(result.secondaryArchetypeIds).toEqual(["a", "b"]);
  });

  it("breaks main ties via ascending id (lexicographic)", () => {
    const archetypes = [
      arch("zeta", { x: 5 }),
      arch("alpha", { x: 5 }),
      arch("mu", { x: 5 }),
    ];
    const result = selectArchetypes(profile({ x: 1 }), archetypes);
    expect(result.mainArchetypeId).toBe("alpha");
  });

  it("treats exactly-on-near boundary as kept (≥, not >)", () => {
    // main 10; near = 7.5; secondary score 7.5 should be kept
    const archetypes = [arch("main", { x: 10 }), arch("near", { x: 7.5 })];
    const result = selectArchetypes(profile({ x: 1 }), archetypes);
    expect(result.secondaryArchetypeIds).toEqual(["near"]);
  });

  it("treats below-near as not kept even if above floor", () => {
    // main 10; near = 7.5; floor = 5
    // candidate 7 → below near → not kept (must satisfy BOTH thresholds)
    const archetypes = [arch("main", { x: 10 }), arch("c", { x: 7 })];
    const result = selectArchetypes(profile({ x: 1 }), archetypes);
    expect(result.secondaryArchetypeIds).toEqual([]);
  });

  it("handles a single archetype (zero secondaries)", () => {
    const archetypes = [arch("solo", { x: 1 })];
    const result = selectArchetypes(profile({ x: 1 }), archetypes);
    expect(result).toEqual({ mainArchetypeId: "solo", secondaryArchetypeIds: [] });
  });

  it("ignores tags absent from the profile (zero contribution)", () => {
    const archetypes = [
      arch("phantom", { unknown: 100 }), // 0 score
      arch("real", { team: 2 }), // 4
    ];
    const result = selectArchetypes(profile({ team: 2 }), archetypes);
    expect(result.mainArchetypeId).toBe("real");
  });
});
