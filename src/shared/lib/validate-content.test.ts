import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { z } from "zod";

import { validateContent, type ContentFileSpec } from "./validate-content";

const ActivityLikeSchema = z
  .object({
    id: z.string().min(1),
    contactLevel: z.enum(["none", "incidental", "controlled", "high"]),
  })
  .passthrough();

const PassThroughArraySchema = z.array(z.unknown());

const SPECS: ContentFileSpec[] = [
  { file: "activities.json", schema: z.array(ActivityLikeSchema) },
  { file: "archetypes.json", schema: PassThroughArraySchema },
  { file: "questions.json", schema: PassThroughArraySchema },
  { file: "tags.json", schema: PassThroughArraySchema },
];

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), "mq-content-"));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

async function write(name: string, value: unknown) {
  await writeFile(path.join(tmpDir, name), JSON.stringify(value, null, 2));
}

const validActivity = { id: "calm-flow", contactLevel: "none" };

describe("validateContent", () => {
  it("returns ok for empty arrays in every spec file", async () => {
    await write("activities.json", []);
    await write("archetypes.json", []);
    await write("questions.json", []);
    await write("tags.json", []);

    const result = await validateContent(tmpDir, SPECS);
    expect(result.ok, JSON.stringify(result, null, 2)).toBe(true);
  });

  it("returns ok for a populated valid seed set", async () => {
    await write("activities.json", [validActivity]);
    await write("archetypes.json", [{ id: "rf" }]);
    await write("questions.json", [{ id: "q1" }]);
    await write("tags.json", [{ id: "t1" }]);

    const result = await validateContent(tmpDir, SPECS);
    expect(result.ok, JSON.stringify(result, null, 2)).toBe(true);
  });

  it("returns errors with file + path when an entity is invalid", async () => {
    await write("activities.json", [{ id: "x", contactLevel: "extreme" }]);
    await write("archetypes.json", []);
    await write("questions.json", []);
    await write("tags.json", []);

    const result = await validateContent(tmpDir, SPECS);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.file).toBe("activities.json");
      expect(result.errors[0]?.message).toMatch(/contactLevel/i);
    }
  });

  it("returns an error when a required content file is missing", async () => {
    const result = await validateContent(tmpDir, SPECS);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.message.match(/missing|not found|enoent/i))).toBe(true);
    }
  });
});
