import { z } from "zod";

/**
 * Map of language-neutral tag id → trait weight (positive or negative).
 * Non-empty; non-zero per entry. Same conventions as `QuizAnswer.tagWeights`.
 */
const TraitWeightsSchema = z
  .record(
    z.string().min(1),
    z
      .number()
      .finite()
      .refine((v) => v !== 0, { message: "weight 0 is a no-op; omit the entry instead" }),
  )
  .refine((o) => Object.keys(o).length > 0, { message: "traitWeights must not be empty" });

export const ArchetypeSchema = z
  .object({
    id: z.string().min(1, "archetype id must not be empty"),
    nameKey: z.string().min(1),
    descriptionKey: z.string().min(1),
    traitWeights: TraitWeightsSchema,
    /** Activity ids in suggested order; at least one required. */
    recommendedActivityIds: z.array(z.string().min(1)).min(1),
  })
  .strict();

export type Archetype = z.infer<typeof ArchetypeSchema>;
