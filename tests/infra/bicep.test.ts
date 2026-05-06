import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const mainBicepPath = path.join(repoRoot, "infra", "main.bicep");
const budgetBicepPath = path.join(repoRoot, "infra", "budget.bicep");

const mainBicep = readFileSync(mainBicepPath, "utf8");
const budgetBicep = readFileSync(budgetBicepPath, "utf8");

/**
 * Strip Bicep `//`-prefixed line comments. The asserts below check for
 * resource/parameter declarations and must not falsely match commentary.
 */
function stripLineComments(source: string): string {
  return source
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("//");
      return idx === -1 ? line : line.slice(0, idx);
    })
    .join("\n");
}

const mainCode = stripLineComments(mainBicep);
const budgetCode = stripLineComments(budgetBicep);

describe("infra/main.bicep — RG-scoped resources for App Service deploy", () => {
  it("targets resourceGroup scope by default (no explicit subscription targetScope)", () => {
    expect(mainCode).not.toMatch(/^\s*targetScope\s*=\s*'subscription'/m);
  });

  it("declares the Linux App Service Plan", () => {
    expect(mainCode).toMatch(/'Microsoft\.Web\/serverfarms@/);
    expect(mainCode).toMatch(/kind:\s*'linux'/);
    expect(mainCode).toMatch(/reserved:\s*true/);
  });

  it("declares the Linux Web App with Node 22 LTS stack and `node server.js` startup", () => {
    expect(mainCode).toMatch(/'Microsoft\.Web\/sites@/);
    expect(mainCode).toMatch(/linuxFxVersion:\s*'NODE\|22-lts'/);
    expect(mainCode).toMatch(/appCommandLine:\s*'node server\.js'/);
  });

  it("declares Application Insights in workspace mode", () => {
    expect(mainCode).toMatch(/'Microsoft\.Insights\/components@/);
    expect(mainCode).toMatch(/IngestionMode:\s*'LogAnalytics'/);
    expect(mainCode).toMatch(/WorkspaceResourceId:\s*logAnalytics\.id/);
  });

  it("declares a Log Analytics workspace", () => {
    expect(mainCode).toMatch(/'Microsoft\.OperationalInsights\/workspaces@/);
  });

  it("routes Web App logs and metrics to Log Analytics via diagnostic settings", () => {
    expect(mainCode).toMatch(/'Microsoft\.Insights\/diagnosticSettings@/);
    expect(mainCode).toMatch(/category:\s*'AppServiceHTTPLogs'/);
    expect(mainCode).toMatch(/category:\s*'AppServiceConsoleLogs'/);
    expect(mainCode).toMatch(/category:\s*'AppServiceAppLogs'/);
    expect(mainCode).toMatch(/category:\s*'AllMetrics'/);
  });

  it("sets every required App Service application setting", () => {
    const required = [
      "WEBSITE_RUN_FROM_PACKAGE",
      "SCM_DO_BUILD_DURING_DEPLOYMENT",
      "ENABLE_ORYX_BUILD",
      "WEBSITES_PORT",
      "APPLICATIONINSIGHTS_CONNECTION_STRING",
    ];
    for (const setting of required) {
      expect(mainCode, `missing app setting ${setting}`).toContain(setting);
    }
  });

  it("disables Oryx server-side build (constraint: prebuilt-artifact-only)", () => {
    expect(mainCode).toMatch(/name:\s*'SCM_DO_BUILD_DURING_DEPLOYMENT'\s*\n\s*value:\s*'false'/);
    expect(mainCode).toMatch(/name:\s*'ENABLE_ORYX_BUILD'\s*\n\s*value:\s*'false'/);
  });

  it("defaults `location` to westeurope (constraint: single-region-westeurope)", () => {
    expect(mainCode).toMatch(/^\s*param\s+location\s+string\s*=\s*'westeurope'/m);
  });

  it("defaults `appServicePlanSku` to B1 (Always On, no F1 daily-CPU lockout)", () => {
    expect(mainCode).toMatch(/^\s*param\s+appServicePlanSku\s+string\s*=\s*'B1'/m);
    // Both SKUs remain in the allowed list — F1 is still selectable for
    // cost-optimisation re-applies, see infra/README.md "F1 ↔ B1 promotion".
    expect(mainCode).toMatch(/'F1'[\s\S]*'B1'/);
  });

  it("requires httpsOnly and TLS 1.2 minimum for the Web App", () => {
    expect(mainCode).toMatch(/httpsOnly:\s*true/);
    expect(mainCode).toMatch(/minTlsVersion:\s*'1\.2'/);
  });
});

describe("infra/budget.bicep — subscription-scoped Consumption Budget", () => {
  it("targets subscription scope", () => {
    expect(budgetCode).toMatch(/^\s*targetScope\s*=\s*'subscription'/m);
  });

  it("declares a Consumption Budget", () => {
    expect(budgetCode).toMatch(/'Microsoft\.Consumption\/budgets@/);
  });

  it("requires `budgetAlertEmail` (no committed default)", () => {
    // Match `param budgetAlertEmail string` with no `=` follow-on,
    // distinguishing required-no-default from `... string = '...'`.
    expect(budgetCode).toMatch(/^\s*param\s+budgetAlertEmail\s+string\s*$/m);
    expect(budgetCode).not.toMatch(/^\s*param\s+budgetAlertEmail\s+string\s*=/m);
  });

  it("defaults the budget amount to $5/mo (cost-guard-required)", () => {
    expect(budgetCode).toMatch(/^\s*param\s+budgetAmount\s+int\s*=\s*5/m);
  });

  it("delivers email notifications via the threshold contact list", () => {
    expect(budgetCode).toMatch(/contactEmails:/);
    expect(budgetCode).toMatch(/budgetAlertEmail/);
  });

  it("uses Monthly time grain", () => {
    expect(budgetCode).toMatch(/timeGrain:\s*'Monthly'/);
  });
});
