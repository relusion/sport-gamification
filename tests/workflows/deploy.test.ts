import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const workflowPath = path.join(repoRoot, ".github", "workflows", "deploy.yml");
const workflow = readFileSync(workflowPath, "utf8");

/**
 * Slice the YAML out of a single named step so per-step assertions don't
 * leak into other steps' bodies. `start` matches the line that names or
 * uses the action; the slice ends at the next top-level step or job key.
 */
function stepSlice(start: RegExp): string {
  const startMatch = workflow.match(start);
  if (!startMatch || startMatch.index === undefined) {
    throw new Error(`step not found in deploy.yml for ${start.source}`);
  }
  const tail = workflow.slice(startMatch.index);
  const next = tail.search(/\n\s*-\s+(?:name:|uses:)/);
  return next === -1 ? tail : tail.slice(0, next);
}

describe(".github/workflows/deploy.yml — push-to-main → Azure App Service", () => {
  it("triggers on push to main and on workflow_dispatch", () => {
    expect(workflow).toMatch(/^on:\s*$/m);
    expect(workflow).toMatch(/push:\s*\n\s*branches:\s*\[main\]/);
    expect(workflow).toMatch(/^\s*workflow_dispatch:\s*$/m);
  });

  it("declares the OIDC permissions block (id-token: write, contents: read)", () => {
    expect(workflow).toMatch(/^permissions:\s*$/m);
    expect(workflow).toMatch(/^\s*id-token:\s*write\s*$/m);
    expect(workflow).toMatch(/^\s*contents:\s*read\s*$/m);
  });

  it("pins the deploy job to the `production` GitHub environment", () => {
    expect(workflow).toMatch(/^\s*environment:\s*production\s*$/m);
  });

  it("uses pnpm via Corepack and Node from .nvmrc with pnpm cache", () => {
    expect(workflow).toMatch(/run:\s*corepack enable/);
    expect(workflow).toMatch(/uses:\s*actions\/setup-node@v4/);
    expect(workflow).toMatch(/node-version-file:\s*\.nvmrc/);
    expect(workflow).toMatch(/cache:\s*pnpm/);
  });

  it("installs deps with frozen lockfile", () => {
    expect(workflow).toMatch(/run:\s*pnpm install --frozen-lockfile/);
  });

  it("runs `pnpm validate:content` BEFORE `pnpm build` (validate-content-before-build constraint)", () => {
    const validateIdx = workflow.indexOf("pnpm validate:content");
    const buildIdx = workflow.indexOf("pnpm build");
    expect(validateIdx).toBeGreaterThan(-1);
    expect(buildIdx).toBeGreaterThan(-1);
    expect(buildIdx).toBeGreaterThan(validateIdx);
  });

  it("packages `.next/standalone`, `.next/static`, `public`, and a minimal package.json stub", () => {
    expect(workflow).toMatch(/cp -r \.next\/standalone\/\. /);
    expect(workflow).toMatch(/cp -r \.next\/static /);
    expect(workflow).toMatch(/cp -r public /);
    expect(workflow).toMatch(/PKGEOF/); // marks the heredoc that writes the stub
    expect(workflow).toMatch(/zip -qr/);
  });

  it("uses azure/login@v2 with OIDC inputs (client-id + tenant-id + subscription-id) and NO client-secret", () => {
    const loginBlock = stepSlice(/uses:\s*azure\/login@v2/);
    expect(loginBlock).toMatch(/client-id:\s*\$\{\{\s*secrets\.AZURE_CLIENT_ID\s*\}\}/);
    expect(loginBlock).toMatch(/tenant-id:\s*\$\{\{\s*secrets\.AZURE_TENANT_ID\s*\}\}/);
    expect(loginBlock).toMatch(/subscription-id:\s*\$\{\{\s*secrets\.AZURE_SUBSCRIPTION_ID\s*\}\}/);
    expect(loginBlock).not.toMatch(/client-secret/);
  });

  it("deploys via azure/webapps-deploy@v3 with `type: zip` and `package: ./app.zip`", () => {
    const deployBlock = stepSlice(/uses:\s*azure\/webapps-deploy@v3/);
    expect(deployBlock).toMatch(/package:\s*\.\/app\.zip/);
    expect(deployBlock).toMatch(/type:\s*zip/);
    expect(deployBlock).toMatch(/app-name:\s*\$\{\{\s*vars\.AZURE_WEBAPP_NAME\s*\}\}/);
    expect(deployBlock).toMatch(/resource-group-name:\s*\$\{\{\s*vars\.AZURE_RESOURCE_GROUP\s*\}\}/);
  });

  it("includes a smoke step that probes BOTH /api/health and /en (smoke-gate constraint)", () => {
    expect(workflow).toMatch(/Smoke/);
    expect(workflow).toMatch(/\$\{BASE_URL\}\/api\/health/);
    expect(workflow).toMatch(/\$\{BASE_URL\}\/en/);
  });

  it("retries the smoke probe long enough to ride out F1 cold-start (~60s budget)", () => {
    // 12 attempts × 5s delay = 60s — match the constants without locking
    // their exact identifier names.
    expect(workflow).toMatch(/max_attempts=12/);
    expect(workflow).toMatch(/delay_seconds=5/);
  });

  it("never wires a publish profile, client-secret input, or hard-coded subscription id", () => {
    // Match the YAML *input* keys (e.g. `client-secret: ...`), not the
    // string appearing inside an explanatory comment.
    expect(workflow).not.toMatch(/^\s*publish-profile:/im);
    expect(workflow).not.toMatch(/^\s*client-secret:/im);
    // No bare GUID-looking subscription IDs leaked into the file.
    expect(workflow).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });
});
