import { z } from "zod";

/**
 * Cross-feature contract (constraints #36, #37). The `version: 1` literal
 * discriminator lets future profile shapes bump and lets consumers `safeParse`
 * and treat version drift as missing — feature 04 redirects to /quiz on miss.
 */
export const QuizProfileSchema = z
  .object({
    version: z.literal(1),
    tagScores: z.record(
      z.string().min(1),
      z
        .number()
        .finite()
        .nonnegative(),
    ),
    answers: z.array(
      z
        .object({
          questionId: z.string().min(1),
          answerIds: z.array(z.string().min(1)),
        })
        .strict(),
    ),
    completedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export type QuizProfile = z.infer<typeof QuizProfileSchema>;
