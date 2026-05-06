import { z } from "zod";

/**
 * Map of language-neutral tag id → weight contribution.
 * Non-empty (an empty map means the answer scores nothing — typically a bug);
 * non-zero per entry (a 0 contribution should be omitted, not encoded).
 */
const TagWeightsSchema = z
  .record(
    z.string().min(1),
    z
      .number()
      .finite()
      .refine((v) => v !== 0, { message: "weight 0 is a no-op; omit the entry instead" }),
  )
  .refine((o) => Object.keys(o).length > 0, { message: "tagWeights must not be empty" });

export const QuizAnswerSchema = z
  .object({
    id: z.string().min(1, "answer id must not be empty"),
    labelKey: z.string().min(1),
    hintKey: z.string().min(1).optional(),
    tagWeights: TagWeightsSchema,
  })
  .strict();

export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;
