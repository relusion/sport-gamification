import type { Activity } from "@/entities/activity";
import type { QuizProfile } from "@/entities/quiz-profile";

const TOP_TAG_COUNT = 3;

/**
 * Bare-string reason key formatters (constraint #41). The engine never calls
 * next-intl; 04 resolves these via `getTranslations('match')` at render
 * time.
 */
export function archetypeReasonKey(archetypeId: string): string {
  return `match.archetypes.${archetypeId}.flavor`;
}

export function activityReasonKey(activityId: string): string {
  return `match.activities.${activityId}.fit`;
}

/**
 * Top-3 contributing tag ids per ranked activity, derived from the dot
 * product over `tagAffinities × tagScores`. Tags missing on the profile
 * side are dropped, as are tags whose contribution evaluates to exactly 0.
 * Tie-break on equal contribution: ascending tag id (lexicographic) —
 * deterministic for snapshot stability.
 */
export function deriveTopTags(profile: QuizProfile, activity: Activity): string[] {
  const contributions: Array<{ tag: string; value: number }> = [];
  for (const [tag, affinity] of Object.entries(activity.tagAffinities)) {
    const score = profile.tagScores[tag];
    if (score === undefined) continue;
    const value = score * affinity;
    if (value === 0) continue;
    contributions.push({ tag, value });
  }

  contributions.sort((a, b) => {
    if (a.value !== b.value) return b.value - a.value;
    return a.tag.localeCompare(b.tag);
  });

  return contributions.slice(0, TOP_TAG_COUNT).map((c) => c.tag);
}
