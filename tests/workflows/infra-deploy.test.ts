import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const workflowPath = path.join(
  repoRoot,
  ".github",
  "workflows",
  "infra-deploy.yml",
);
const workflow = readFileSync(workflowPath, "utf8");

/**
 * Strip YAML `#`-prefixed line comments so substring/order assertions
 * don't false-match against explanatory commentary (e.g. a "what this
 * workflow does NOT do" header that mentions `--mode complete`). Same
 * approach as `tests/infra/bicep.test.ts`, adjusted for YAML.
 */
function stripLineComments(source: string): string {
  return source
    .split("\n")
    .map((line) => {
      const match = line.match(/(^|\s)#/);
      if (!match) return line;
      // Group 1 — `(^|\s)` — always captures (possibly empty) when the
      // regex matches, so the non-null assertions are sound under
      // `noUncheckedIndexedAccess`.
      const idx = match.index! + match[1]!.length;
      return line.slice(0, idx);
    })
    .join("\n");
}

const code = stripLineComments(workflow);

/**
 * Slice the YAML out of a single named step so per-step assertions don't
 * leak into other steps' bodies. Operates on `code` (comment-stripped)
 * so commentary inside a step body doesn't shift the slice boundary.
 * Mirrors the helper in tests/workflows/deploy.test.ts.
 */
function stepSlice(start: RegExp): string {
  const startMatch = code.match(start);
  if (!startMatch || startMatch.index === undefined) {
    throw new Error(`step not found in infra-deploy.yml for ${start.source}`);
  }
  const tail = code.slice(startMatch.index);
  const next = tail.search(/\n\s*-\s+(?:name:|uses:)/);
  return next === -1 ? tail : tail.slice(0, next);
}

describe(".github/workflows/infra-deploy.yml — manual Bicep apply via OIDC", () => {
  it("triggers on workflow_dispatch ONLY (no push trigger — IAM/IaC stays off the push-to-main path)", () => {
    expect(workflow).toMatch(/^on:\s*$/m);
    expect(workflow).toMatch(/^\s*workflow_dispatch:\s*$/m);
    // Must NOT auto-apply on push — the existing deploy.yml comment
    // explains the rationale ("steady-state IaC is operator-applied so
    // the per-push deploy lane stays fast and IAM changes stay off the
    // push-to-main path"). This workflow respects that.
    expect(workflow).not.toMatch(/^\s*push:\s*$/m);
  });

  it("declares the OIDC permissions block (id-token: write, contents: read)", () => {
    expect(workflow).toMatch(/^permissions:\s*$/m);
    expect(workflow).toMatch(/^\s*id-token:\s*write\s*$/m);
    expect(workflow).toMatch(/^\s*contents:\s*read\s*$/m);
  });

  it("pins the apply job to the `production` GitHub environment (matches workflow_dispatch federated-credential subject)", () => {
    expect(workflow).toMatch(/^\s*environment:\s*production\s*$/m);
  });

  it("checks out the repo so infra/main.bicep is on disk for az to read", () => {
    expect(workflow).toMatch(/uses:\s*actions\/checkout@v4/);
  });

  it("uses azure/login@v2 with OIDC inputs (client-id + tenant-id + subscription-id) and NO client-secret (no-long-lived-azure-secrets)", () => {
    const loginBlock = stepSlice(/uses:\s*azure\/login@v2/);
    expect(loginBlock).toMatch(
      /client-id:\s*\$\{\{\s*secrets\.AZURE_CLIENT_ID\s*\}\}/,
    );
    expect(loginBlock).toMatch(
      /tenant-id:\s*\$\{\{\s*secrets\.AZURE_TENANT_ID\s*\}\}/,
    );
    expect(loginBlock).toMatch(
      /subscription-id:\s*\$\{\{\s*secrets\.AZURE_SUBSCRIPTION_ID\s*\}\}/,
    );
    expect(loginBlock).not.toMatch(/client-secret/);
  });

  it("runs `az deployment group what-if` BEFORE `az deployment group create` (operators see planned changes before mutation)", () => {
    const whatIfIdx = code.indexOf("az deployment group what-if");
    const createIdx = code.indexOf("az deployment group create");
    expect(whatIfIdx).toBeGreaterThan(-1);
    expect(createIdx).toBeGreaterThan(-1);
    expect(createIdx).toBeGreaterThan(whatIfIdx);
  });

  it("targets infra/main.bicep with --resource-group from vars.AZURE_RESOURCE_GROUP and --webAppName from vars.AZURE_WEBAPP_NAME on BOTH the what-if and create calls", () => {
    // Both az calls reference the same template + RG + name, so the
    // what-if matches what the create will apply.
    const allMatches = code.match(/az deployment group (?:what-if|create)[\s\S]*?(?=\n\s*-\s+(?:name:|uses:)|\n\s*$)/g);
    expect(allMatches).not.toBeNull();
    expect(allMatches!.length).toBeGreaterThanOrEqual(2);
    for (const block of allMatches!) {
      expect(block).toMatch(/-f\s+infra\/main\.bicep/);
      expect(block).toMatch(
        /-g\s+\$\{\{\s*vars\.AZURE_RESOURCE_GROUP\s*\}\}/,
      );
      expect(block).toMatch(
        /webAppName=\$\{\{\s*vars\.AZURE_WEBAPP_NAME\s*\}\}/,
      );
    }
  });

  it("does NOT pass `--mode complete` — stays in incremental mode (declarative-idempotent-iac, no surprise deletes)", () => {
    expect(code).not.toMatch(/--mode\s+complete/i);
    expect(code).not.toMatch(/--mode\s+Complete/);
  });

  it("does NOT apply infra/budget.bicep — budget stays operator-applied (sub-scoped, OIDC SP only has RG-scoped Contributor)", () => {
    expect(code).not.toMatch(/budget\.bicep/);
    expect(code).not.toMatch(/az deployment sub create/);
  });

  it("exposes appServicePlanSku as a workflow_dispatch input with allowed values F1 and B1, defaulting to F1", () => {
    // The input lets operators flip F1↔B1 from the GitHub UI without
    // editing yaml, matching the F1↔B1 promotion criteria in
    // infra/README.md.
    expect(workflow).toMatch(/inputs:\s*$/m);
    expect(workflow).toMatch(/appServicePlanSku:/);
    const skuBlock = workflow.match(
      /appServicePlanSku:\s*[\s\S]*?(?=\n\s{0,8}\w+:\s*$|\n\s*jobs:)/,
    );
    expect(skuBlock).not.toBeNull();
    expect(skuBlock![0]).toMatch(/type:\s*choice/);
    expect(skuBlock![0]).toMatch(/default:\s*['"]?F1['"]?/);
    expect(skuBlock![0]).toMatch(/options:[\s\S]*F1[\s\S]*B1/);
  });

  it("forwards appServicePlanSku from the dispatch input into the bicep parameter on the create call", () => {
    const createBlock = code.match(
      /az deployment group create[\s\S]*?(?=\n\s*-\s+(?:name:|uses:)|\n\s*$)/,
    );
    expect(createBlock).not.toBeNull();
    expect(createBlock![0]).toMatch(
      /appServicePlanSku=\$\{\{\s*(?:github\.event\.)?inputs\.appServicePlanSku\s*\}\}/,
    );
  });

  it("never wires a publish profile, client-secret input, or hard-coded subscription id (no-secrets-in-repo)", () => {
    expect(workflow).not.toMatch(/^\s*publish-profile:/im);
    expect(workflow).not.toMatch(/^\s*client-secret:/im);
    // No bare GUID-looking subscription IDs leaked into the file.
    expect(workflow).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
    // No committed email addresses (budget-alert-email lives in secrets).
    expect(workflow).not.toMatch(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  });

  it("uses a concurrency group so two manual dispatches don't race for the same RG deployment slot", () => {
    expect(workflow).toMatch(/^concurrency:\s*$/m);
    // Group keyed by something stable for the same RG target.
    expect(workflow).toMatch(/group:\s*infra-deploy/);
  });
});
