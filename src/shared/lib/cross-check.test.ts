import { describe, it, expect } from "vitest";

import { crossCheck, type CrossCheckSpec } from "./cross-check";

interface Source {
  id: string;
  refs: string[];
}

interface Reference {
  tagId: string;
}

const spec = (
  overrides: Partial<CrossCheckSpec<Source, Reference>>,
): CrossCheckSpec<Source, Reference> => ({
  label: "test.refs",
  source: [],
  reference: [],
  sourceKeys: (s) => s.refs,
  sourceId: (s) => s.id,
  referenceKey: (r) => r.tagId,
  ...overrides,
});

describe("crossCheck", () => {
  it("returns ok when every source key appears in the reference set", () => {
    const result = crossCheck(
      spec({
        source: [{ id: "a1", refs: ["t1", "t2"] }],
        reference: [{ tagId: "t1" }, { tagId: "t2" }, { tagId: "t3" }],
      }),
    );
    expect(result.ok).toBe(true);
  });

  it("returns errors with label, source id, and offending key for dangling refs", () => {
    const result = crossCheck(
      spec({
        source: [
          { id: "a1", refs: ["t1", "missing"] },
          { id: "a2", refs: ["also-missing"] },
        ],
        reference: [{ tagId: "t1" }],
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const messages = result.errors.map((e) => e.message);
      expect(result.errors.every((e) => e.label === "test.refs")).toBe(true);
      expect(messages.some((m) => m.includes("missing"))).toBe(true);
      expect(messages.some((m) => m.includes("also-missing"))).toBe(true);
      expect(result.errors.some((e) => e.sourceId === "a1")).toBe(true);
      expect(result.errors.some((e) => e.sourceId === "a2")).toBe(true);
    }
  });

  it("treats an empty source as ok (no-op)", () => {
    const result = crossCheck(
      spec({ source: [], reference: [{ tagId: "anything" }] }),
    );
    expect(result.ok).toBe(true);
  });

  it("treats an empty source as ok even when reference is also empty", () => {
    const result = crossCheck(spec({ source: [], reference: [] }));
    expect(result.ok).toBe(true);
  });

  it("reports every dangling key per source (no early exit)", () => {
    const result = crossCheck(
      spec({
        source: [{ id: "a1", refs: ["x", "y", "z"] }],
        reference: [{ tagId: "y" }],
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const offending = result.errors.map((e) => e.key).sort();
      expect(offending).toEqual(["x", "z"]);
    }
  });
});
