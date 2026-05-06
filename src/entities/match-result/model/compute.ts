import type { Activity } from "@/entities/activity";
import type { Archetype } from "@/entities/archetype";
import type { QuizProfile } from "@/entities/quiz-profile";
import { TagCategorySchema, type Tag, type TagCategory } from "@/entities/tag";

import { activityReasonKey, archetypeReasonKey, deriveTopTags } from "./explain";
import { rankActivities } from "./rank-activities";
import { MatchResultSchema, type MatchResult } from "./schema";
import { selectArchetypes } from "./select-archetype";

/**
 * Pure orchestrator (constraints #34, #35). Chains
 * `selectArchetypes` → `rankActivities` → `explain` and assembles the
 * final `MatchResult`. The trailing `MatchResultSchema.parse` is defence
 * in depth on the cross-feature contract — it should never fire on valid
 * inputs but catches type-only refactors that bypass the schema.
 *
 * Purity guarantees:
 * - No `Date.now`, `Math.random`, `crypto`, `process.env`.
 * - No module-load side effects: this file exports plain functions, no
 *   top-level state.
 * - Output is deterministic: identical inputs → identical outputs (asserted
 *   by the shuffle-invariance property test in `compute.test.ts`).
 *
 * Post-MVP extension paths (decisions.md §48) — keep additive:
 * - Hard exclusions: add `excludeIfTags?: TagId[]` to `ActivitySchema`,
 *   filter `activities` before `rankActivities`. Pipeline becomes
 *   `filter → score → rank → top-N`.
 * - Mismatch penalty: add `negativeTagAffinities?` field on Activity (or
 *   permit signed values in `tagAffinities`); the dot product carries the
 *   sign through unchanged.
 */
export function computeMatchResult(
  profile: QuizProfile,
  activities: readonly Activity[],
  archetypes: readonly Archetype[],
  tags: readonly Tag[],
): MatchResult {
  const tagsByCategory = indexTagsByCategory(tags);

  const { mainArchetypeId, secondaryArchetypeIds } = selectArchetypes(profile, archetypes);
  const rankedScored = rankActivities(profile, activities, tagsByCategory);

  const activityIndex = new Map<string, Activity>();
  for (const a of activities) activityIndex.set(a.id, a);

  const rankedActivities = rankedScored.map((r) => {
    const activity = activityIndex.get(r.id);
    const topTags = activity ? deriveTopTags(profile, activity) : [];
    return {
      id: r.id,
      score: r.score,
      componentBreakdown: r.componentBreakdown,
      topTags,
    };
  });

  const reasonActivities: Record<string, string> = {};
  for (const r of rankedActivities) {
    reasonActivities[r.id] = activityReasonKey(r.id);
  }

  const candidate: MatchResult = {
    version: 1,
    mainArchetypeId,
    secondaryArchetypeIds,
    rankedActivities,
    reasonKeys: {
      archetype: archetypeReasonKey(mainArchetypeId),
      activities: reasonActivities,
    },
  };

  return MatchResultSchema.parse(candidate);
}

function indexTagsByCategory(tags: readonly Tag[]): Record<TagCategory, readonly Tag[]> {
  // Initialise from `TagCategorySchema.options` so the accumulator stays
  // exhaustive against the entity enum without manual updates.
  const acc = Object.fromEntries(
    TagCategorySchema.options.map((c) => [c, [] as Tag[]]),
  ) as Record<TagCategory, Tag[]>;

  for (const t of tags) acc[t.category].push(t);

  // Sort each category's tag list by id so downstream dot-product sums
  // iterate in id order regardless of input authoring order. Combined with
  // the analogous sort in `archetypeScore`, this makes the engine's
  // floating-point sums permutation-invariant (constraint #47).
  for (const category of TagCategorySchema.options) {
    acc[category].sort((a, b) => a.id.localeCompare(b.id));
  }

  return acc;
}
