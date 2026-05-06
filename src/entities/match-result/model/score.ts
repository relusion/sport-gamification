import type { Activity } from "@/entities/activity";
import type { QuizProfile } from "@/entities/quiz-profile";
import type { Tag, TagCategory } from "@/entities/tag";

import type { ComponentName } from "./schema";

/**
 * Engine policy: which `TagCategory` members feed which scoring component.
 * Typed `satisfies Record<ComponentName, readonly TagCategory[]>` so that
 * adding a new `ComponentName` (or removing one) is a TypeScript compile
 * error here. The companion `TAG_CATEGORY_TO_COMPONENT` derivation below
 * adds the converse exhaustiveness on `TagCategory` (constraint #37).
 *
 * The mapping must be a partition: every `TagCategory` appears in exactly
 * one bucket. The unit test in `score.test.ts` enforces the partition.
 */
export const COMPONENT_BUCKETS = {
  preference_fit: ["preference", "skill"],
  environment_fit: ["environment", "seasonality"],
  social_fit: ["social", "contact"],
  confidence_fit: ["energy", "movement"],
  practical_fit: ["cost", "equipment"],
} as const satisfies Record<ComponentName, readonly TagCategory[]>;

/**
 * Inverse of `COMPONENT_BUCKETS`. Built once at module load by walking the
 * partition. The cast is safe because the bucket-map literal is a partition
 * (asserted by the schema-test); `TAG_CATEGORY_TO_COMPONENT` is then a
 * `Record<TagCategory, ComponentName>` — adding a new `TagCategory` member
 * without updating `COMPONENT_BUCKETS` makes the partition incomplete and
 * the matching unit test fails (#37).
 */
export const TAG_CATEGORY_TO_COMPONENT: Record<TagCategory, ComponentName> = (() => {
  const acc: Partial<Record<TagCategory, ComponentName>> = {};
  for (const [component, categories] of Object.entries(COMPONENT_BUCKETS) as Array<
    [ComponentName, readonly TagCategory[]]
  >) {
    for (const category of categories) acc[category] = component;
  }
  return acc as Record<TagCategory, ComponentName>;
})();

/**
 * Pure dot product over a fixed bucket of `TagCategory` members. For each
 * tag in the activity's bucket, multiplies the activity's affinity by the
 * profile's score (default 0 on either side); sums the contributions.
 *
 * The function takes a pre-built `tagsByCategory` index so the caller can
 * compute it once for an entire ranking pass (constraint #35: pure, no
 * mutation, no module-level closures). Caller is responsible for sorting
 * `tagsByCategory[c]` by tag id (handled centrally in `compute.ts`'s
 * `indexTagsByCategory`) — id-sorted iteration is what makes the dot-product
 * sum order independent of input array order, satisfying constraint #47
 * (shuffle-invariance) under floating-point arithmetic too.
 */
export function componentFit(
  profile: QuizProfile,
  activity: Activity,
  tagsByCategory: Record<TagCategory, readonly Tag[]>,
  bucket: readonly TagCategory[],
): number {
  let total = 0;
  for (const category of bucket) {
    const tagsInCategory = tagsByCategory[category];
    for (const tag of tagsInCategory) {
      const affinity = activity.tagAffinities[tag.id];
      if (affinity === undefined) continue;
      const score = profile.tagScores[tag.id];
      if (score === undefined) continue;
      total += affinity * score;
    }
  }
  return total;
}

/**
 * Five named wrappers pre-bind a bucket so that downstream callers (the
 * orchestrator and per-component unit tests) get one focused entry point
 * each. Single private body — no copy-pasted dot-product loops (#38).
 */
export function preferenceFit(
  profile: QuizProfile,
  activity: Activity,
  tagsByCategory: Record<TagCategory, readonly Tag[]>,
): number {
  return componentFit(profile, activity, tagsByCategory, COMPONENT_BUCKETS.preference_fit);
}

export function environmentFit(
  profile: QuizProfile,
  activity: Activity,
  tagsByCategory: Record<TagCategory, readonly Tag[]>,
): number {
  return componentFit(profile, activity, tagsByCategory, COMPONENT_BUCKETS.environment_fit);
}

export function socialFit(
  profile: QuizProfile,
  activity: Activity,
  tagsByCategory: Record<TagCategory, readonly Tag[]>,
): number {
  return componentFit(profile, activity, tagsByCategory, COMPONENT_BUCKETS.social_fit);
}

export function confidenceFit(
  profile: QuizProfile,
  activity: Activity,
  tagsByCategory: Record<TagCategory, readonly Tag[]>,
): number {
  return componentFit(profile, activity, tagsByCategory, COMPONENT_BUCKETS.confidence_fit);
}

export function practicalFit(
  profile: QuizProfile,
  activity: Activity,
  tagsByCategory: Record<TagCategory, readonly Tag[]>,
): number {
  return componentFit(profile, activity, tagsByCategory, COMPONENT_BUCKETS.practical_fit);
}
