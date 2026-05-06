import type { Archetype } from "@/entities/archetype";
import type { Tag } from "@/entities/tag";
import {
  COMPONENT_BUCKETS,
  TAG_CATEGORY_TO_COMPONENT,
  type ComponentName,
} from "@/entities/match-result";

export interface TraitBar {
  component: ComponentName;
  weight: number;
}

const FIXED_ORDER = Object.keys(COMPONENT_BUCKETS) as readonly ComponentName[];

/**
 * Bucket the archetype's `traitWeights` by `ComponentName` (via the engine
 * policy `TAG_CATEGORY_TO_COMPONENT`), sum per bucket, then normalize 0..1
 * against the largest bucket sum. Tags absent from the catalogue are
 * dropped silently (constraint #56/#43). Returns exactly five bars in the
 * fixed order `COMPONENT_BUCKETS` declares — `preference_fit`,
 * `environment_fit`, `social_fit`, `confidence_fit`, `practical_fit`.
 */
export function deriveTraitBars(mainArchetype: Archetype, tags: Tag[]): TraitBar[] {
  const tagById = new Map<string, Tag>(tags.map((t) => [t.id, t]));
  const sums: Record<ComponentName, number> = {
    preference_fit: 0,
    environment_fit: 0,
    social_fit: 0,
    confidence_fit: 0,
    practical_fit: 0,
  };

  for (const [tagId, weight] of Object.entries(mainArchetype.traitWeights)) {
    const tag = tagById.get(tagId);
    if (!tag) continue;
    const component = TAG_CATEGORY_TO_COMPONENT[tag.category];
    sums[component] += weight;
  }

  const max = FIXED_ORDER.reduce((m, c) => (sums[c] > m ? sums[c] : m), 0);
  return FIXED_ORDER.map((component) => ({
    component,
    weight: max > 0 ? sums[component] / max : 0,
  }));
}
