import { describe, it, expect } from "vitest";

import enMatch from "../../../messages/en/match.json";
import ruMatch from "../../../messages/ru/match.json";

const COMPONENT_NAMES = [
  "preference_fit",
  "environment_fit",
  "social_fit",
  "confidence_fit",
  "practical_fit",
] as const;

const RESULT_TOP_KEYS = [
  "heroHeadline",
  "supportingArchetypesHeading",
  "whyThisFitsHeading",
  "exploratoryDisclaimer",
  "revealCta",
  "revealCtaSubtitle",
  "activityGridHeading",
  "restartButton",
  "reviewLink",
  "confidenceMeters",
  "tagFamilies",
  "attributeValues",
] as const;

const CONFIDENCE_KEYS = [
  "easyToStart",
  "needsLessons",
  "needsEquipment",
  "needsTeam",
] as const;

const TAG_FAMILY_KEYS = [
  "environment",
  "social",
  "beginnerFriendliness",
  "equipmentLevel",
] as const;

const ATTRIBUTE_VALUE_GROUPS = {
  environment: ["indoor", "outdoor", "water"],
  socialMode: ["solo", "team", "small-group", "instructor-led"],
  beginnerFriendliness: ["low", "medium", "high"],
  equipmentLevel: ["none", "minimal", "low", "medium", "high"],
} as const;

function assertKeysPresent(
  bag: Record<string, unknown>,
  keys: readonly string[],
  label: string,
) {
  for (const key of keys) {
    expect(bag[key], `${label}.${key} must be a non-empty string`).toBeTypeOf("string");
    expect((bag[key] as string).length, `${label}.${key} must be non-empty`).toBeGreaterThan(0);
  }
}

describe("messages/{en,ru}/match.json — 04 keys", () => {
  it("EN match.components carries five axis labels", () => {
    assertKeysPresent(enMatch.components, COMPONENT_NAMES, "en.components");
  });

  it("RU match.components carries five axis labels in Cyrillic", () => {
    assertKeysPresent(ruMatch.components, COMPONENT_NAMES, "ru.components");
    expect(ruMatch.components.preference_fit).toMatch(/[Ѐ-ӿ]/);
  });

  it("EN match.results carries every screen-level key", () => {
    for (const key of RESULT_TOP_KEYS) {
      expect(
        enMatch.results[key as keyof typeof enMatch.results],
        `en.results.${key}`,
      ).toBeDefined();
    }
    assertKeysPresent(enMatch.results.confidenceMeters, CONFIDENCE_KEYS, "en.results.confidenceMeters");
    assertKeysPresent(enMatch.results.tagFamilies, TAG_FAMILY_KEYS, "en.results.tagFamilies");
    for (const [group, values] of Object.entries(ATTRIBUTE_VALUE_GROUPS)) {
      const bag = (enMatch.results.attributeValues as Record<string, Record<string, string> | undefined>)[group];
      expect(bag, `en.results.attributeValues.${group}`).toBeDefined();
      assertKeysPresent(bag as Record<string, unknown>, values, `en.results.attributeValues.${group}`);
    }
  });

  it("RU match.results mirrors every screen-level key", () => {
    for (const key of RESULT_TOP_KEYS) {
      expect(
        ruMatch.results[key as keyof typeof ruMatch.results],
        `ru.results.${key}`,
      ).toBeDefined();
    }
    assertKeysPresent(ruMatch.results.confidenceMeters, CONFIDENCE_KEYS, "ru.results.confidenceMeters");
    assertKeysPresent(ruMatch.results.tagFamilies, TAG_FAMILY_KEYS, "ru.results.tagFamilies");
    for (const [group, values] of Object.entries(ATTRIBUTE_VALUE_GROUPS)) {
      const bag = (ruMatch.results.attributeValues as Record<string, Record<string, string> | undefined>)[group];
      expect(bag, `ru.results.attributeValues.${group}`).toBeDefined();
      assertKeysPresent(bag as Record<string, unknown>, values, `ru.results.attributeValues.${group}`);
    }
  });

  it("at least one RU axis label is longer than its EN counterpart (long-RU sentinel)", () => {
    const longer = COMPONENT_NAMES.some(
      (k) => ruMatch.components[k].length > enMatch.components[k].length,
    );
    expect(longer, "expected at least one RU component label longer than EN").toBe(true);
  });
});
