import { describe, it, expect } from "vitest";

import { TagSchema } from "./schema";

describe("TagSchema", () => {
  it("accepts a valid tag with a known category", () => {
    const ok = {
      id: "team-oriented",
      category: "social",
      nameKey: "tag.social.teamOriented",
    };
    expect(() => TagSchema.parse(ok)).not.toThrow();
  });

  it("rejects an unknown category with a path-pointed error", () => {
    const bad = { id: "x", category: "not-a-real-category", nameKey: "tag.x" };
    const result = TagSchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("category");
    }
  });

  it("rejects an empty id", () => {
    const bad = { id: "", category: "social", nameKey: "tag.x" };
    expect(() => TagSchema.parse(bad)).toThrow();
  });
});
