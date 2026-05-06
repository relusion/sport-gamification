import { describe, it, expect } from "vitest";

import { ActivitySchema } from "./schema";

const validActivity = {
  id: "calm-flow",
  ageRange: { min: 8, max: 16 },
  socialMode: ["solo", "team"],
  energy: ["medium"],
  environment: ["indoor"],
  movementSkills: ["balance", "flexibility"],
  contactLevel: "none",
  costLevel: "low",
  equipmentLevel: "minimal",
  beginnerFriendliness: "high",
  seasonality: ["all"],
  nameKey: "activity.calmFlow.name",
  descriptionKey: "activity.calmFlow.description",
  tagAffinities: { calm: 2, focus: 1 },
};

describe("ActivitySchema", () => {
  it("accepts a fully populated activity", () => {
    expect(() => ActivitySchema.parse(validActivity)).not.toThrow();
  });

  it("accepts optional accessibility/safety note keys", () => {
    const withOptional = {
      ...validActivity,
      accessibilityNotesKey: "activity.calmFlow.access",
      safetyNotesKey: "activity.calmFlow.safety",
    };
    expect(() => ActivitySchema.parse(withOptional)).not.toThrow();
  });

  it("rejects when ageRange.min > ageRange.max", () => {
    const bad = { ...validActivity, ageRange: { min: 16, max: 8 } };
    const result = ActivitySchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects unknown enum value with a path-pointed error", () => {
    const bad = { ...validActivity, contactLevel: "extreme" };
    const result = ActivitySchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("contactLevel");
    }
  });

  it("rejects ages outside the kid-facing range 4-25", () => {
    const bad = { ...validActivity, ageRange: { min: 1, max: 99 } };
    expect(ActivitySchema.safeParse(bad).success).toBe(false);
  });

  it("requires at least one entry in array attributes", () => {
    const bad = { ...validActivity, socialMode: [] };
    expect(ActivitySchema.safeParse(bad).success).toBe(false);
  });
});

describe("ActivitySchema.tagAffinities", () => {
  it("accepts a well-formed map of bare tag ids to non-zero finite numbers", () => {
    const parsed = ActivitySchema.parse(validActivity);
    expect(parsed.tagAffinities).toEqual({ calm: 2, focus: 1 });
  });

  it("rejects an empty tagAffinities record", () => {
    const result = ActivitySchema.safeParse({ ...validActivity, tagAffinities: {} });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("tagAffinities"))).toBe(true);
    }
  });

  it("rejects a tagAffinities entry with value 0", () => {
    const result = ActivitySchema.safeParse({
      ...validActivity,
      tagAffinities: { calm: 0, focus: 1 },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.match(/no-op|0/i))).toBe(true);
    }
  });

  it("rejects a tagAffinities entry with non-finite value (Infinity)", () => {
    const result = ActivitySchema.safeParse({
      ...validActivity,
      tagAffinities: { calm: Infinity },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a tagAffinities entry with NaN", () => {
    const result = ActivitySchema.safeParse({
      ...validActivity,
      tagAffinities: { calm: Number.NaN },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a tagAffinities entry with empty-string tag id", () => {
    const result = ActivitySchema.safeParse({
      ...validActivity,
      tagAffinities: { "": 2 },
    });
    expect(result.success).toBe(false);
  });

  it("requires tagAffinities (omitted is rejected)", () => {
    const { tagAffinities: _t, ...without } = validActivity;
    const result = ActivitySchema.safeParse(without);
    expect(result.success).toBe(false);
  });
});
