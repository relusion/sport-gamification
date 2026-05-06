import { describe, it, expect } from "vitest";

import type { Activity } from "@/entities/activity";
import type { QuizProfile } from "@/entities/quiz-profile";
import type { Tag, TagCategory } from "@/entities/tag";

import {
  COMPONENT_BUCKETS,
  TAG_CATEGORY_TO_COMPONENT,
  componentFit,
  preferenceFit,
  environmentFit,
  socialFit,
  confidenceFit,
  practicalFit,
} from "./score";
import type { ComponentName } from "./schema";

const tag = (id: string, category: TagCategory): Tag => ({ id, category, nameKey: `match.tags.${id}.name` });

const ACTIVITY_BASE: Activity = {
  id: "test-activity",
  ageRange: { min: 6, max: 12 },
  socialMode: ["solo"],
  energy: ["medium"],
  environment: ["indoor"],
  movementSkills: ["balance"],
  contactLevel: "none",
  costLevel: "low",
  equipmentLevel: "minimal",
  beginnerFriendliness: "high",
  seasonality: ["all"],
  nameKey: "match.activities.test-activity.name",
  descriptionKey: "match.activities.test-activity.description",
  tagAffinities: { calm: 1 },
};

function profile(scores: Record<string, number>): QuizProfile {
  return { version: 1, tagScores: scores, answers: [] };
}

function indexByCategory(tags: readonly Tag[]): Record<TagCategory, readonly Tag[]> {
  const acc: Record<TagCategory, Tag[]> = {
    social: [],
    energy: [],
    environment: [],
    movement: [],
    contact: [],
    cost: [],
    equipment: [],
    seasonality: [],
    skill: [],
    preference: [],
  };
  for (const t of tags) acc[t.category].push(t);
  return acc;
}

describe("COMPONENT_BUCKETS", () => {
  it("covers every TagCategory exactly once across the five lists", () => {
    const seen = new Set<TagCategory>();
    for (const bucket of Object.values(COMPONENT_BUCKETS)) {
      for (const cat of bucket) {
        expect(seen.has(cat), `${cat} appears in more than one bucket`).toBe(false);
        seen.add(cat);
      }
    }
    const allCategories: TagCategory[] = [
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
    ];
    expect([...seen].sort()).toEqual(allCategories.sort());
  });

  it("matches the engine policy spec map", () => {
    expect(COMPONENT_BUCKETS).toEqual({
      preference_fit: ["preference", "skill"],
      environment_fit: ["environment", "seasonality"],
      social_fit: ["social", "contact"],
      confidence_fit: ["energy", "movement"],
      practical_fit: ["cost", "equipment"],
    });
  });

  it("derives an inverse TAG_CATEGORY_TO_COMPONENT covering every category", () => {
    const expectedInverse: Record<TagCategory, ComponentName> = {
      preference: "preference_fit",
      skill: "preference_fit",
      environment: "environment_fit",
      seasonality: "environment_fit",
      social: "social_fit",
      contact: "social_fit",
      energy: "confidence_fit",
      movement: "confidence_fit",
      cost: "practical_fit",
      equipment: "practical_fit",
    };
    expect(TAG_CATEGORY_TO_COMPONENT).toEqual(expectedInverse);
  });
});

describe("componentFit (generic)", () => {
  it("returns 0 when buckets disjoint from activity tags", () => {
    const tagsByCategory = indexByCategory([tag("calm", "energy")]);
    const a: Activity = { ...ACTIVITY_BASE, tagAffinities: { calm: 3 } };
    const value = componentFit(profile({ calm: 2 }), a, tagsByCategory, [
      "preference",
      "skill",
    ]);
    expect(value).toBe(0);
  });

  it("returns the dot product over the bucket's tag ids", () => {
    const tagsByCategory = indexByCategory([
      tag("focus", "preference"),
      tag("structured", "preference"),
    ]);
    const a: Activity = {
      ...ACTIVITY_BASE,
      tagAffinities: { focus: 2, structured: 1.5 },
    };
    const p = profile({ focus: 3, structured: 4 });
    // 3*2 + 4*1.5 = 6 + 6 = 12
    expect(componentFit(p, a, tagsByCategory, ["preference"])).toBe(12);
  });

  it("treats missing keys (on either side) as zero contribution", () => {
    const tagsByCategory = indexByCategory([
      tag("focus", "preference"),
      tag("orphan", "preference"),
    ]);
    const a: Activity = { ...ACTIVITY_BASE, tagAffinities: { focus: 2 } };
    const p = profile({ focus: 3, orphan: 99 });
    // orphan: profile has score, activity has no affinity → 0
    expect(componentFit(p, a, tagsByCategory, ["preference"])).toBe(6);
  });
});

describe("named wrappers (per-component isolation)", () => {
  function wrappers() {
    return {
      preference_fit: preferenceFit,
      environment_fit: environmentFit,
      social_fit: socialFit,
      confidence_fit: confidenceFit,
      practical_fit: practicalFit,
    } satisfies Record<ComponentName, (p: QuizProfile, a: Activity, t: Record<TagCategory, readonly Tag[]>) => number>;
  }

  const cases: Array<{ component: ComponentName; tagId: string; category: TagCategory }> = [
    { component: "preference_fit", tagId: "freeform", category: "preference" },
    { component: "environment_fit", tagId: "outdoor", category: "environment" },
    { component: "social_fit", tagId: "team", category: "social" },
    { component: "confidence_fit", tagId: "energy", category: "energy" },
    { component: "practical_fit", tagId: "cheap", category: "cost" },
  ];

  for (const c of cases) {
    it(`only ${c.component} contributes when activity has a single ${c.category} tag`, () => {
      const tagsByCategory = indexByCategory([tag(c.tagId, c.category)]);
      const a: Activity = { ...ACTIVITY_BASE, tagAffinities: { [c.tagId]: 2 } };
      const p = profile({ [c.tagId]: 3 });
      const fns = wrappers();
      for (const name of Object.keys(fns) as ComponentName[]) {
        const fn = fns[name];
        const value = fn(p, a, tagsByCategory);
        if (name === c.component) {
          expect(value, `${name} should be nonzero`).toBe(6);
        } else {
          expect(value, `${name} should be 0`).toBe(0);
        }
      }
    });
  }
});
