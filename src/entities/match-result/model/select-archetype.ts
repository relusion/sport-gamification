import type { Archetype } from "@/entities/archetype";
import type { QuizProfile } from "@/entities/quiz-profile";

import {
  MAX_SECONDARIES,
  SECONDARY_FLOOR,
  SECONDARY_NEAR_THRESHOLD,
} from "./constants";

export interface ArchetypeSelection {
  mainArchetypeId: string;
  secondaryArchetypeIds: string[];
}

function archetypeScore(profile: QuizProfile, archetype: Archetype): number {
  // Sort trait keys ascending so the sum order depends only on ids, not on
  // input authoring order. Floating-point addition isn't associative, so
  // shuffle-invariance (constraint #47) requires order-stable iteration here.
  const sortedKeys = Object.keys(archetype.traitWeights).sort();
  let total = 0;
  for (const tag of sortedKeys) {
    const weight = archetype.traitWeights[tag]!;
    const score = profile.tagScores[tag];
    if (score === undefined) continue;
    total += score * weight;
  }
  return total;
}

/**
 * Pure archetype picker (constraint #40). Computes the dot product of
 * `profile.tagScores × archetype.traitWeights` for every archetype, picks
 * the highest as `main` (ascending id tie-break), then keeps secondaries
 * whose score is `≥ NEAR × main.score` AND `≥ FLOOR × main.score`, capped
 * at `MAX_SECONDARIES`. Tie-break among secondaries: ascending id.
 *
 * If no archetype passes the floor (or there is only one archetype),
 * returns zero secondaries — still valid per scope §10.4 "1–2" range.
 *
 * @throws Error if `archetypes` is empty.
 */
export function selectArchetypes(
  profile: QuizProfile,
  archetypes: readonly Archetype[],
): ArchetypeSelection {
  if (archetypes.length === 0) {
    throw new Error("selectArchetypes: archetypes must not be empty");
  }

  const scored = archetypes
    .map((a) => ({ id: a.id, score: archetypeScore(profile, a) }))
    .sort((x, y) => {
      if (x.score !== y.score) return y.score - x.score;
      return x.id.localeCompare(y.id);
    });

  const main = scored[0]!;
  const nearCutoff = SECONDARY_NEAR_THRESHOLD * main.score;
  const floorCutoff = SECONDARY_FLOOR * main.score;

  const secondaries: string[] = [];
  for (let i = 1; i < scored.length && secondaries.length < MAX_SECONDARIES; i++) {
    const candidate = scored[i]!;
    if (candidate.score >= nearCutoff && candidate.score >= floorCutoff) {
      secondaries.push(candidate.id);
    }
  }

  return { mainArchetypeId: main.id, secondaryArchetypeIds: secondaries };
}
