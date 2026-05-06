import { z } from "zod";

import { QuizProfileSchema } from "@/entities/quiz-profile";

/**
 * Feature-internal schema for the in-progress draft (NOT an entity — see
 * spec.md §"Data Model"). Validated at the storage boundary so a hand-edited
 * sessionStorage payload, an old-shape draft from a prior version, or a
 * partial write can never crash the reducer on hydrate.
 */
export const QuizDraftSchema = z
  .object({
    phase: z.enum(["intro", "step", "review", "completed"]),
    currentStepIndex: z.number().int().nonnegative(),
    answers: z.record(z.string().min(1), z.array(z.string().min(1))),
    completedProfile: QuizProfileSchema.nullable(),
  })
  .strict();

export type QuizDraft = z.infer<typeof QuizDraftSchema>;
