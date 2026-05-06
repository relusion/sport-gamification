import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ActivitySchema } from "@/entities/activity";
import { ArchetypeSchema } from "@/entities/archetype";
import { TagSchema } from "@/entities/tag";

import { computeMatchResult } from "./compute";
import { PERSONAS, type PersonaName } from "./__fixtures__/personas";

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

const personaNames: PersonaName[] = [
  "balanced",
  "team-energy",
  "calm-focus",
  "outdoor-endurance",
  "expression-rhythm",
];

describe("computeMatchResult against real seed (5 persona snapshots)", () => {
  for (const name of personaNames) {
    it(`persona '${name}' produces a stable MatchResult`, () => {
      const profile = PERSONAS[name];
      const result = computeMatchResult(profile, activities, archetypes, tags);
      expect(result).toMatchSnapshot();
    });
  }
});
