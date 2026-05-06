import { z } from "zod";

/**
 * Tag categories. Tags are the language-neutral scoring vocabulary
 * (constraint #9). Translations of tag display labels live in `messages/`,
 * not here.
 */
export const TagCategorySchema = z.enum([
  "social",
  "energy",
  "environment",
  "movement",
  "contact",
  "cost",
  "equipment",
  "seasonality",
  "skill",
  "preference",
]);
export type TagCategory = z.infer<typeof TagCategorySchema>;

export const TagSchema = z
  .object({
    id: z.string().min(1, "tag id must not be empty"),
    category: TagCategorySchema,
    nameKey: z.string().min(1, "nameKey must not be empty"),
  })
  .strict();

export type Tag = z.infer<typeof TagSchema>;
