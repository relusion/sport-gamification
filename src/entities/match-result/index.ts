export {
  MatchResultSchema,
  ComponentNameSchema,
  type MatchResult,
  type ComponentName,
  type RankedActivity,
} from "./model/schema";
export { computeMatchResult } from "./model/compute";
export {
  TOP_ACTIVITY_COUNT,
  SECONDARY_NEAR_THRESHOLD,
  SECONDARY_FLOOR,
  MAX_SECONDARIES,
} from "./model/constants";
export { COMPONENT_BUCKETS, TAG_CATEGORY_TO_COMPONENT } from "./model/score";
