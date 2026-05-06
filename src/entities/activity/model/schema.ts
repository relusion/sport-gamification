import { z } from "zod";

/**
 * Map of language-neutral tag id → activity affinity weight (positive or negative).
 * Same conventions as `Archetype.traitWeights`: non-empty record, every value
 * finite and non-zero (encode-or-omit). Negative entries are reserved for the
 * post-MVP mismatch-penalty path (#48); the schema permits sign and the engine
 * relies on the invariants holding.
 */
const TagAffinitiesSchema = z
  .record(
    z.string().min(1),
    z
      .number()
      .finite()
      .refine((v) => v !== 0, { message: "weight 0 is a no-op; omit the entry instead" }),
  )
  .refine((o) => Object.keys(o).length > 0, { message: "tagAffinities must not be empty" });

// Enum vocabularies kept here (vs. derived from Tag IDs) so the runtime
// validator catches typos at build time without needing the tag catalogue.
export const SocialModeSchema = z.enum(["solo", "team", "small-group", "instructor-led"]);
export const EnergySchema = z.enum(["low", "medium", "high"]);
export const EnvironmentSchema = z.enum(["indoor", "outdoor", "water"]);
export const MovementSkillSchema = z.enum([
  "balance",
  "flexibility",
  "endurance",
  "strength",
  "coordination",
  "speed",
  "rhythm",
]);
export const ContactLevelSchema = z.enum(["none", "incidental", "controlled", "high"]);
/** Resource scale used for cost and equipment requirements. */
export const ResourceLevelSchema = z.enum(["none", "minimal", "low", "medium", "high"]);
export const SeasonalitySchema = z.enum(["all", "spring", "summer", "autumn", "winter"]);
export const BeginnerFriendlinessSchema = z.enum(["low", "medium", "high"]);

/** Kid-facing age envelope; downstream features may filter against this. */
export const AGE_MIN = 4;
export const AGE_MAX = 25;

export const ActivitySchema = z
  .object({
    id: z.string().min(1, "activity id must not be empty"),
    ageRange: z
      .object({
        min: z.number().int().min(AGE_MIN).max(AGE_MAX),
        max: z.number().int().min(AGE_MIN).max(AGE_MAX),
      })
      .refine((r) => r.min <= r.max, {
        message: "ageRange.min must be <= ageRange.max",
        path: ["min"],
      }),
    socialMode: z.array(SocialModeSchema).min(1),
    energy: z.array(EnergySchema).min(1),
    environment: z.array(EnvironmentSchema).min(1),
    movementSkills: z.array(MovementSkillSchema).min(1),
    contactLevel: ContactLevelSchema,
    costLevel: ResourceLevelSchema,
    equipmentLevel: ResourceLevelSchema,
    beginnerFriendliness: BeginnerFriendlinessSchema,
    seasonality: z.array(SeasonalitySchema).min(1),
    accessibilityNotesKey: z.string().min(1).optional(),
    safetyNotesKey: z.string().min(1).optional(),
    nameKey: z.string().min(1),
    descriptionKey: z.string().min(1),
    tagAffinities: TagAffinitiesSchema,
  })
  .strict();

export type Activity = z.infer<typeof ActivitySchema>;
