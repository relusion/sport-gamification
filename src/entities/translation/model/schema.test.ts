import { describe, it, expect } from "vitest";

import { TranslationSchema } from "./schema";

describe("TranslationSchema", () => {
  it("accepts a translation with EN-only string", () => {
    expect(() => TranslationSchema.parse({ key: "ui.cta", en: "Start" })).not.toThrow();
  });

  it("accepts a translation with both EN and RU", () => {
    expect(() =>
      TranslationSchema.parse({ key: "ui.cta", en: "Start", ru: "Старт" }),
    ).not.toThrow();
  });

  it("rejects an empty key", () => {
    expect(TranslationSchema.safeParse({ key: "", en: "x" }).success).toBe(false);
  });

  it("rejects an empty EN string", () => {
    expect(TranslationSchema.safeParse({ key: "ui.cta", en: "" }).success).toBe(false);
  });
});
