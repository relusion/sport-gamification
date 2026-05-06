import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ActivitySchema, type Activity } from "@/entities/activity";
import { ArchetypeSchema, type Archetype } from "@/entities/archetype";
import { TagSchema, type Tag } from "@/entities/tag";
import { crossCheck } from "@/shared/lib/cross-check";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..", "..", "..", "..");
const contentDir = path.join(repoRoot, "content");

function loadParsed<T extends z.ZodTypeAny>(file: string, schema: T): z.infer<T> {
  const raw = readFileSync(path.join(contentDir, file), "utf8");
  return schema.parse(JSON.parse(raw));
}

const activities = loadParsed("activities.json", z.array(ActivitySchema));
const archetypes = loadParsed("archetypes.json", z.array(ArchetypeSchema));
const tags = loadParsed("tags.json", z.array(TagSchema));

describe("cross-check against real seed catalogue", () => {
  it("Archetype.recommendedActivityIds → Activity.id (no dangling refs)", () => {
    const result = crossCheck<Archetype, Activity>({
      label: "Archetype.recommendedActivityIds → Activity.id",
      source: archetypes,
      reference: activities,
      sourceKeys: (a) => a.recommendedActivityIds,
      sourceId: (a) => a.id,
      referenceKey: (r) => r.id,
    });
    expect(result, JSON.stringify(result, null, 2)).toEqual({ ok: true });
  });

  it("Archetype.traitWeights keys → Tag.id (no dangling refs)", () => {
    const result = crossCheck<Archetype, Tag>({
      label: "Archetype.traitWeights → Tag.id",
      source: archetypes,
      reference: tags,
      sourceKeys: (a) => Object.keys(a.traitWeights),
      sourceId: (a) => a.id,
      referenceKey: (r) => r.id,
    });
    expect(result, JSON.stringify(result, null, 2)).toEqual({ ok: true });
  });

  it("Activity.tagAffinities keys → Tag.id (no dangling refs)", () => {
    const result = crossCheck<Activity, Tag>({
      label: "Activity.tagAffinities → Tag.id",
      source: activities,
      reference: tags,
      sourceKeys: (a) => Object.keys(a.tagAffinities),
      sourceId: (a) => a.id,
      referenceKey: (r) => r.id,
    });
    expect(result, JSON.stringify(result, null, 2)).toEqual({ ok: true });
  });

  it("detects a dangling reference (manual probe with synthetic clone)", () => {
    const cloneArchetypes: Archetype[] = [
      ...archetypes,
      {
        id: "synthetic-bad",
        nameKey: "match.archetypes.synthetic-bad.name",
        descriptionKey: "match.archetypes.synthetic-bad.description",
        traitWeights: { focus: 1 },
        recommendedActivityIds: ["nonexistent-activity"],
      },
    ];
    const result = crossCheck<Archetype, Activity>({
      label: "Archetype.recommendedActivityIds → Activity.id",
      source: cloneArchetypes,
      reference: activities,
      sourceKeys: (a) => a.recommendedActivityIds,
      sourceId: (a) => a.id,
      referenceKey: (r) => r.id,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some(
          (e) => e.sourceId === "synthetic-bad" && e.key === "nonexistent-activity",
        ),
      ).toBe(true);
    }
  });
});
