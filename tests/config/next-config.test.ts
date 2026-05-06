import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect } from "vitest";

import { nextConfig } from "../../next.config";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("next.config — App Service deploy preconditions", () => {
  it("emits a standalone server bundle so Azure can run `node server.js`", () => {
    expect(nextConfig.output).toBe("standalone");
  });

  it("pins outputFileTracingRoot to the repo so .next/standalone/server.js is at the canonical path", () => {
    expect(nextConfig.outputFileTracingRoot).toBe(repoRoot);
  });

  it("keeps the static security-headers fallback in place", () => {
    expect(typeof nextConfig.headers).toBe("function");
  });

  it("keeps reactStrictMode enabled", () => {
    expect(nextConfig.reactStrictMode).toBe(true);
  });

  it("keeps poweredByHeader disabled", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
