/**
 * Tunable engine constants. Re-exported through the entity barrel so 04 can
 * read them at render time without depending on internal `model/` paths
 * (constraints #17, #39, #40).
 */

/** Maximum number of activities returned by `rankActivities` / `computeMatchResult`. */
export const TOP_ACTIVITY_COUNT = 5;

/** Secondary archetypes must score ≥ this fraction of the main score AND ≥ floor. */
export const SECONDARY_NEAR_THRESHOLD = 0.75;

/** Hard floor: secondaries below this fraction of the main score are dropped. */
export const SECONDARY_FLOOR = 0.5;

/** Cap on the number of secondary archetypes returned. */
export const MAX_SECONDARIES = 2;
