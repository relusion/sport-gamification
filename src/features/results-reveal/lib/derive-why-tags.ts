import type { Archetype } from "@/entities/archetype";
import type { Tag } from "@/entities/tag";
import type { QuizProfile } from "@/entities/quiz-profile";

const MAX_WHY_TAGS = 3;

/**
 * For each tag id present in `archetype.traitWeights`, computes the
 * contribution `traitWeight × (profile.tagScores[tagId] ?? 0)`, sorts
 * descending by contribution with an ascending tag-id tie-break, and
 * returns the top-3 tag ids. Tags whose final contribution is exactly zero
 * are dropped — an all-zero profile yields an empty list.
 *
 * The `tags` parameter is accepted for API symmetry with the other
 * derivers and to leave room for future filtering by catalogue membership;
 * the current rule, per spec.md, is contribution-driven and does not
 * exclude tags missing from the catalogue (the caller resolves names
 * separately).
 */
export function deriveWhyTags(
  profile: QuizProfile,
  archetype: Archetype,
  _tags: Tag[],
): string[] {
  const contributions = Object.entries(archetype.traitWeights).map(
    ([tagId, weight]) => {
      const score = profile.tagScores[tagId] ?? 0;
      return { tagId, contribution: weight * score };
    },
  );

  if (contributions.every((c) => c.contribution === 0)) return [];

  contributions.sort((a, b) => {
    if (b.contribution !== a.contribution) return b.contribution - a.contribution;
    return a.tagId < b.tagId ? -1 : a.tagId > b.tagId ? 1 : 0;
  });

  return contributions.slice(0, MAX_WHY_TAGS).map((c) => c.tagId);
}
