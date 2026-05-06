import { describe, it, expect } from "vitest";

import type { Activity } from "@/entities/activity";

import { deriveConfidence } from "./derive-confidence";

function activity(overrides: Partial<Activity> = {}): Activity {
  const base: Activity = {
    id: "fixture",
    ageRange: { min: 6, max: 18 },
    socialMode: ["solo"],
    energy: ["medium"],
    environment: ["indoor"],
    movementSkills: ["balance"],
    contactLevel: "none",
    costLevel: "low",
    equipmentLevel: "none",
    beginnerFriendliness: "medium",
    seasonality: ["all"],
    nameKey: "match.activities.fixture.name",
    descriptionKey: "match.activities.fixture.description",
    tagAffinities: { social: 1 },
  };
  return { ...base, ...overrides };
}

describe("deriveConfidence", () => {
  it("easyToStart=true and needsLessons=false when beginnerFriendliness is high", () => {
    const c = deriveConfidence(activity({ beginnerFriendliness: "high" }));
    expect(c.easyToStart).toBe(true);
    expect(c.needsLessons).toBe(false);
  });

  it("easyToStart=false and needsLessons=true when beginnerFriendliness is low", () => {
    const c = deriveConfidence(activity({ beginnerFriendliness: "low" }));
    expect(c.easyToStart).toBe(false);
    expect(c.needsLessons).toBe(true);
  });

  it("easyToStart=false and needsLessons=false when beginnerFriendliness is medium", () => {
    const c = deriveConfidence(activity({ beginnerFriendliness: "medium" }));
    expect(c.easyToStart).toBe(false);
    expect(c.needsLessons).toBe(false);
  });

  it.each([
    ["none", false],
    ["minimal", false],
    ["low", false],
    ["medium", true],
    ["high", true],
  ] as const)(
    "needsEquipment is true only for medium/high (equipmentLevel=%s → %s)",
    (level, expected) => {
      const c = deriveConfidence(activity({ equipmentLevel: level }));
      expect(c.needsEquipment).toBe(expected);
    },
  );

  it("needsTeam=true when socialMode is ['team'] without solo", () => {
    expect(deriveConfidence(activity({ socialMode: ["team"] })).needsTeam).toBe(true);
  });

  it("needsTeam=true when socialMode is ['team', 'small-group'] without solo", () => {
    expect(
      deriveConfidence(activity({ socialMode: ["team", "small-group"] })).needsTeam,
    ).toBe(true);
  });

  it("needsTeam=true when socialMode is only ['small-group']", () => {
    expect(
      deriveConfidence(activity({ socialMode: ["small-group"] })).needsTeam,
    ).toBe(true);
  });

  it("needsTeam=false when socialMode includes 'solo' even alongside 'team' (rule #4)", () => {
    expect(
      deriveConfidence(activity({ socialMode: ["team", "solo"] })).needsTeam,
    ).toBe(false);
  });

  it("needsTeam=false when socialMode is ['solo']", () => {
    expect(deriveConfidence(activity({ socialMode: ["solo"] })).needsTeam).toBe(false);
  });

  it("needsTeam=false when socialMode is ['instructor-led']", () => {
    expect(
      deriveConfidence(activity({ socialMode: ["instructor-led"] })).needsTeam,
    ).toBe(false);
  });
});
