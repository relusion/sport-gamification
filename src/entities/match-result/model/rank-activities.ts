import type { Activity } from "@/entities/activity";
import type { QuizProfile } from "@/entities/quiz-profile";
import type { Tag, TagCategory } from "@/entities/tag";

import { TOP_ACTIVITY_COUNT } from "./constants";
import type { RankedActivity } from "./schema";
import {
  confidenceFit,
  environmentFit,
  practicalFit,
  preferenceFit,
  socialFit,
} from "./score";

/**
 * Pure top-N activity ranker (constraint #39). Scores each activity by
 * summing the five `componentFit` results, sorts descending by score then
 * ascending by id (lexicographic tie-break), and returns the first
 * `TOP_ACTIVITY_COUNT` entries. Each result carries the populated
 * `componentBreakdown`. `topTags` is left as an empty array for the
 * `explain` stage to fill in.
 */
export function rankActivities(
  profile: QuizProfile,
  activities: readonly Activity[],
  tagsByCategory: Record<TagCategory, readonly Tag[]>,
): RankedActivity[] {
  const scored: RankedActivity[] = activities.map((a) => {
    const breakdown = {
      preference_fit: preferenceFit(profile, a, tagsByCategory),
      environment_fit: environmentFit(profile, a, tagsByCategory),
      social_fit: socialFit(profile, a, tagsByCategory),
      confidence_fit: confidenceFit(profile, a, tagsByCategory),
      practical_fit: practicalFit(profile, a, tagsByCategory),
    };
    const score =
      breakdown.preference_fit +
      breakdown.environment_fit +
      breakdown.social_fit +
      breakdown.confidence_fit +
      breakdown.practical_fit;
    return { id: a.id, score, componentBreakdown: breakdown, topTags: [] };
  });

  scored.sort((x, y) => {
    if (x.score !== y.score) return y.score - x.score;
    return x.id.localeCompare(y.id);
  });

  return scored.slice(0, TOP_ACTIVITY_COUNT);
}
