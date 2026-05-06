import { describe, it, expect } from "vitest";

import {
  COMPONENT_BUCKETS,
  TAG_CATEGORY_TO_COMPONENT,
  ComponentNameSchema,
} from "./index";
import { TagCategorySchema } from "@/entities/tag";

describe("@/entities/match-result barrel", () => {
  it("re-exports COMPONENT_BUCKETS with exactly five ComponentName keys", () => {
    const keys = Object.keys(COMPONENT_BUCKETS).sort();
    const expected = [...ComponentNameSchema.options].sort();
    expect(keys).toEqual(expected);
  });

  it("re-exports TAG_CATEGORY_TO_COMPONENT covering every TagCategory exactly once", () => {
    for (const category of TagCategorySchema.options) {
      expect(TAG_CATEGORY_TO_COMPONENT[category]).toBeDefined();
      expect(ComponentNameSchema.options).toContain(TAG_CATEGORY_TO_COMPONENT[category]);
    }
  });
});
