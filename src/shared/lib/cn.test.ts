import { describe, it, expect } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins class fragments", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("merges conflicting Tailwind classes (later wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("handles object form for conditional classes", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });
});
