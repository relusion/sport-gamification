import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect } from "vitest";
import { ESLint } from "eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const fixturePath = path.join(repoRoot, "src/shared/__lint_fixtures__/illegal-import.ts");

describe("import/no-restricted-paths layer zones", () => {
  it("flags shared/* importing from features/*", async () => {
    // ignore: false bypasses the project-wide ignore patterns so the
    // fixture file (which is ignored by the project lint run) can still
    // be linted in isolation by this test.
    const eslint = new ESLint({ cwd: repoRoot, ignore: false });
    const source = await readFile(fixturePath, "utf8");

    const results = await eslint.lintText(source, {
      filePath: fixturePath,
      warnIgnored: false,
    });

    const messages = results.flatMap((r) => r.messages);
    const violations = messages.filter((m) => m.ruleId === "import/no-restricted-paths");

    expect(
      violations.length,
      `expected at least one no-restricted-paths violation, got messages: ${JSON.stringify(
        messages,
        null,
        2,
      )}`,
    ).toBeGreaterThanOrEqual(1);
    expect(violations[0]!.message).toMatch(/shared/i);
  });
});
