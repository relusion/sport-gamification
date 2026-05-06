import { readFile } from "node:fs/promises";
import path from "node:path";

import type { z } from "zod";

export interface ContentFileSpec {
  /** File name relative to the content directory (e.g. "activities.json"). */
  file: string;
  /** Zod schema the parsed JSON must satisfy (typically a `z.array(EntitySchema)`). */
  schema: z.ZodTypeAny;
}

export interface ValidationError {
  file: string;
  message: string;
}

export type ValidationResult = { ok: true } | { ok: false; errors: ValidationError[] };

interface NodeIoError extends Error {
  code?: string;
}

function formatZodIssue(file: string, issue: z.ZodIssue): ValidationError {
  const pointer = issue.path.length === 0 ? "<root>" : issue.path.join(".");
  return { file, message: `${pointer}: ${issue.message}` };
}

/**
 * Validates each `contentDir/<spec.file>` against `spec.schema`. Returns a
 * structured result so callers can surface the offending file and field path.
 *
 * Generic by design: the entity wiring (which schemas → which files) lives at
 * the call site (script layer or test fixture). This keeps `shared/` free of
 * `entities/` imports, satisfying the layer-zone constraint.
 *
 * Constraint #23: invalid JSON fails the build with a clear error.
 */
export async function validateContent(
  contentDir: string,
  specs: readonly ContentFileSpec[],
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  for (const entry of specs) {
    const fullPath = path.join(contentDir, entry.file);
    let raw: string;
    try {
      raw = await readFile(fullPath, "utf8");
    } catch (err) {
      const ioErr = err as NodeIoError;
      if (ioErr.code === "ENOENT") {
        errors.push({ file: entry.file, message: `missing required content file: ${entry.file}` });
      } else {
        errors.push({ file: entry.file, message: `read failed: ${ioErr.message}` });
      }
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const ioErr = err as Error;
      errors.push({ file: entry.file, message: `invalid JSON: ${ioErr.message}` });
      continue;
    }

    const result = entry.schema.safeParse(parsed);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(formatZodIssue(entry.file, issue));
      }
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
