import { z } from "zod";

/**
 * Authoring-tooling schema for translation entries. Runtime translation
 * resolution is via next-intl + the messages catalogue; this schema lets
 * tooling validate any flat translation export.
 */
export const TranslationSchema = z
  .object({
    key: z.string().min(1, "translation key must not be empty"),
    en: z.string().min(1, "EN translation must not be empty"),
    ru: z.string().min(1).optional(),
  })
  .strict();

export type Translation = z.infer<typeof TranslationSchema>;
