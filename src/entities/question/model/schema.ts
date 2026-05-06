import { z } from "zod";

import { QuizAnswerSchema } from "@/entities/answer";

import { refineByType } from "./refine-by-type";

export const QuestionTypeSchema = z.enum([
  "single",
  "multi",
  "slider",
  "ranking",
  "would-you-rather",
  "visual",
]);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

/** Question areas mirror scope.md §9.2: the buckets the quiz covers. */
export const QuestionAreaSchema = z.enum([
  "social",
  "energy",
  "environment",
  "movement",
  "contact",
  "preference",
  "practical",
]);
export type QuestionArea = z.infer<typeof QuestionAreaSchema>;

export const QuizQuestionSchema = z
  .object({
    id: z.string().min(1, "question id must not be empty"),
    type: QuestionTypeSchema,
    area: QuestionAreaSchema,
    promptKey: z.string().min(1),
    subtitleKey: z.string().min(1).optional(),
    answers: z.array(QuizAnswerSchema).min(2, "a question needs at least two answers"),
  })
  .strict()
  .superRefine(refineByType);

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
