import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { ActivitySchema, type Activity } from "../src/entities/activity/model/schema";
import { ArchetypeSchema, type Archetype } from "../src/entities/archetype/model/schema";
import { QuizQuestionSchema } from "../src/entities/question/model/schema";
import { TagSchema, type Tag } from "../src/entities/tag/model/schema";
import { crossCheck, type CrossCheckResult } from "../src/shared/lib/cross-check";
import { validateContent, type ContentFileSpec } from "../src/shared/lib/validate-content";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const contentDir = path.join(repoRoot, "content");

const ACTIVITIES_FILE = "activities.json";
const ARCHETYPES_FILE = "archetypes.json";
const QUESTIONS_FILE = "questions.json";
const TAGS_FILE = "tags.json";

// Translations live in `messages/<locale>/*.json` and are validated by
// next-intl's loader at runtime — they are intentionally NOT part of this
// content/* sweep. Do not move translations into content/ (constraint #9).
const SPECS: ContentFileSpec[] = [
  { file: ACTIVITIES_FILE, schema: z.array(ActivitySchema) },
  { file: ARCHETYPES_FILE, schema: z.array(ArchetypeSchema) },
  { file: QUESTIONS_FILE, schema: z.array(QuizQuestionSchema) },
  { file: TAGS_FILE, schema: z.array(TagSchema) },
];

async function loadParsed<T extends z.ZodTypeAny>(
  file: string,
  schema: T,
): Promise<z.infer<T>> {
  const raw = await readFile(path.join(contentDir, file), "utf8");
  return schema.parse(JSON.parse(raw));
}

interface CrossCheckIssue {
  file: string;
  message: string;
}

function collectIssues(file: string, result: CrossCheckResult, into: CrossCheckIssue[]): void {
  if (result.ok) return;
  for (const err of result.errors) into.push({ file, message: err.message });
}

async function runCrossCheck(): Promise<CrossCheckIssue[]> {
  const [activities, archetypes, tags] = await Promise.all([
    loadParsed(ACTIVITIES_FILE, z.array(ActivitySchema)),
    loadParsed(ARCHETYPES_FILE, z.array(ArchetypeSchema)),
    loadParsed(TAGS_FILE, z.array(TagSchema)),
  ]);

  const issues: CrossCheckIssue[] = [];

  collectIssues(
    ARCHETYPES_FILE,
    crossCheck<Archetype, Activity>({
      label: "Archetype.recommendedActivityIds → Activity.id",
      source: archetypes,
      reference: activities,
      sourceKeys: (a) => a.recommendedActivityIds,
      sourceId: (a) => a.id,
      referenceKey: (r) => r.id,
    }),
    issues,
  );

  collectIssues(
    ARCHETYPES_FILE,
    crossCheck<Archetype, Tag>({
      label: "Archetype.traitWeights → Tag.id",
      source: archetypes,
      reference: tags,
      sourceKeys: (a) => Object.keys(a.traitWeights),
      sourceId: (a) => a.id,
      referenceKey: (r) => r.id,
    }),
    issues,
  );

  collectIssues(
    ACTIVITIES_FILE,
    crossCheck<Activity, Tag>({
      label: "Activity.tagAffinities → Tag.id",
      source: activities,
      reference: tags,
      sourceKeys: (a) => Object.keys(a.tagAffinities),
      sourceId: (a) => a.id,
      referenceKey: (r) => r.id,
    }),
    issues,
  );

  return issues;
}

async function main(): Promise<void> {
  const result = await validateContent(contentDir, SPECS);

  if (!result.ok) {
    console.error(`content: ${result.errors.length} error(s) in ${contentDir}`);
    for (const err of result.errors) {
      console.error(`  ${err.file}  →  ${err.message}`);
    }
    process.exit(1);
  }

  const crossIssues = await runCrossCheck();
  if (crossIssues.length > 0) {
    console.error(`content: ${crossIssues.length} cross-reference error(s) in ${contentDir}`);
    for (const err of crossIssues) {
      console.error(`  ${err.file}  →  ${err.message}`);
    }
    process.exit(1);
  }

  console.log(`content: ok (${contentDir})`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
