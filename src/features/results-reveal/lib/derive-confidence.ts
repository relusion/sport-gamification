import type { Activity } from "@/entities/activity";

export interface ConfidenceFlags {
  easyToStart: boolean;
  needsLessons: boolean;
  needsEquipment: boolean;
  needsTeam: boolean;
}

/**
 * Source-of-truth for the four confidence-meter rules (constraint #61).
 * Pure: identical activity → identical flags.
 *
 * - easyToStart   = beginnerFriendliness === 'high'
 * - needsLessons  = beginnerFriendliness === 'low'
 * - needsEquipment = equipmentLevel ∈ {medium, high}
 * - needsTeam     = socialMode includes 'team' or 'small-group' AND no 'solo'
 */
export function deriveConfidence(activity: Activity): ConfidenceFlags {
  const social = activity.socialMode;
  const includesGroup = social.includes("team") || social.includes("small-group");
  const includesSolo = social.includes("solo");
  const equipmentNeeded =
    activity.equipmentLevel === "medium" || activity.equipmentLevel === "high";

  return {
    easyToStart: activity.beginnerFriendliness === "high",
    needsLessons: activity.beginnerFriendliness === "low",
    needsEquipment: equipmentNeeded,
    needsTeam: includesGroup && !includesSolo,
  };
}
