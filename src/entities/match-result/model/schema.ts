import { z } from "zod";

/**
 * Five scoring components. Each component aggregates the dot product over a
 * fixed bucket of `TagCategory` members; the bucket map is engine policy and
 * lives in `./score.ts`. Adding a new component or a new TagCategory is a
 * compile-time-checked change (see `score.ts`).
 */
export const ComponentNameSchema = z.enum([
  "preference_fit",
  "environment_fit",
  "social_fit",
  "confidence_fit",
  "practical_fit",
]);
export type ComponentName = z.infer<typeof ComponentNameSchema>;

const ComponentBreakdownSchema = z
  .object({
    preference_fit: z.number().finite(),
    environment_fit: z.number().finite(),
    social_fit: z.number().finite(),
    confidence_fit: z.number().finite(),
    practical_fit: z.number().finite(),
  })
  .strict();

const RankedActivitySchema = z
  .object({
    id: z.string().min(1),
    score: z.number().finite(),
    componentBreakdown: ComponentBreakdownSchema,
    topTags: z.array(z.string().min(1)).max(3),
  })
  .strict();

export type RankedActivity = z.infer<typeof RankedActivitySchema>;

/**
 * Cross-feature contract for the matching engine output (constraints #33,
 * #34). The `version: 1` literal discriminator mirrors `QuizProfileSchema` so
 * that, if a future feature ever caches the result in storage, the
 * `safeParse`-on-read + redirect-on-miss pattern transfers directly. In MVP
 * the result does NOT cross sessionStorage — 04 recomputes via
 * `computeMatchResult` on every render.
 */
export const MatchResultSchema = z
  .object({
    version: z.literal(1),
    mainArchetypeId: z.string().min(1),
    secondaryArchetypeIds: z.array(z.string().min(1)),
    rankedActivities: z.array(RankedActivitySchema),
    reasonKeys: z
      .object({
        archetype: z.string().min(1),
        activities: z.record(z.string().min(1), z.string().min(1)),
      })
      .strict(),
  })
  .strict();

export type MatchResult = z.infer<typeof MatchResultSchema>;
