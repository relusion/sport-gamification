# MoveQuest — Azure App Service Deploy

Operator runbook for the Azure App Service Linux deploy pipeline. The
application is a Next.js 15 SSR app that ships from GitHub Actions to a Linux
Web App in `westeurope` via OIDC federation.

This file is the single source of operator-facing instructions. The
declarative side lives in `main.bicep` (RG-scoped resources) and `budget.bicep`
(subscription-scoped Consumption Budget). The imperative one-time identity
bootstrap lives in `setup-oidc.sh`.

---

## Prerequisites

You'll need:

- **Azure CLI 2.60+** (`az --version`).
- **Bicep CLI 0.30+** (`az bicep version` — installed automatically by `az`
  on first use, but pin a recent version).
- **`jq`** for the OIDC bootstrap script.
- A signed-in `az` context (`az login`) on the **target subscription**.
- One operator-level identity with sufficient perms to run the bootstrap
  exactly once:
  - **Microsoft.Authorization/roleAssignments/write** on the target resource
    group (e.g. `User Access Administrator` or `Owner`).
  - Permission to create Entra ID app registrations (typically the
    `Application Developer` directory role or higher).
- A globally unique App Service site name. The Web App's default hostname is
  `https://<webAppName>.azurewebsites.net`.

You will NOT need:

- A publish profile, service-principal password, or any long-lived Azure
  secret. Authentication from GitHub is exclusively GitHub OIDC ↔ federated
  credential.
- A custom domain, Key Vault, or Container Apps. All of those are explicitly
  out of scope for this feature.

---

## One-time bootstrap (run once per repo)

The OIDC trust between GitHub and Azure is provisioned imperatively because
Bicep's Microsoft.Graph extension is preview and not enabled in every tenant.

```bash
# from the repo root
./infra/setup-oidc.sh \
  <github-owner> \
  <github-repo> \
  <target-resource-group> \
  <web-app-name>
```

The script is idempotent — re-runs after partial failure converge cleanly. On
success it prints the values to copy into GitHub:

- Secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`,
  `BUDGET_ALERT_EMAIL`.
- Variables: `AZURE_RESOURCE_GROUP`, `AZURE_WEBAPP_NAME`.

You must also create a GitHub **Environment** named `production` so the
federated-credential subject for `workflow_dispatch` runs matches.

---

## Apply the IaC (each time the template changes)

The deploy workflow does **not** apply Bicep — steady-state IaC is operator-
applied so the per-push deploy lane stays fast and IAM changes stay off the
push-to-main path. Apply manually whenever `main.bicep` or `budget.bicep`
changes.

### 1. Resource-group resources

```bash
az group create -n <rg-name> -l westeurope    # first run only
az deployment group create \
  -g <rg-name> \
  -f infra/main.bicep \
  -p webAppName=<unique-app-name>
```

Required parameters:

| Parameter | Required | Default | Notes |
| --- | --- | --- | --- |
| `webAppName` | yes | — | Globally unique. |
| `location` | no | `westeurope` | Pinned by `single-region-westeurope` constraint. |
| `appServicePlanSku` | no | `F1` | `F1` (free) or `B1` (~$13/mo, Always On). |
| `appServicePlanName` | no | `asp-<webAppName>` | |
| `appInsightsName` | no | `ai-<webAppName>` | |
| `logAnalyticsName` | no | `law-<webAppName>` | |
| `diagnosticSettingsName` | no | `diag-<webAppName>` | |

Re-running against an existing RG produces no drift (Bicep is declarative).

### 2. Subscription-scoped Consumption Budget

```bash
az deployment sub create \
  -l westeurope \
  -f infra/budget.bicep \
  -p budgetAlertEmail=<recipient@example.com>
```

`budgetAlertEmail` has **no committed default** — this is intentional so
re-applying the template never quietly retargets alerts to a stale address.

The budget defaults to $5/mo with email notifications at 80% and 100% of the
threshold. Both notifications go to `budgetAlertEmail` directly via the
budget's `notifications.contactEmails` list (no separate Action Group is
provisioned — see `spec.md § Spec Patches` for the rationale).

---

## F1 ↔ B1 promotion criteria

`F1` is the free tier (60 min CPU/day, 1 GB RAM, no Always On). It is the
default and works for "ship the app, see if anyone shows up" workflows.

Promote to **B1** (~$13/mo, Always On, 1.75 GB RAM, no CPU minute cap) when
**any one** of the following becomes a recurring complaint or operational
issue:

1. Sustained cold-start latency reports (F1 has no Always On, so the first
   request after idle is multi-second).
2. The deploy smoke step or App Insights shows the daily CPU minute cap being
   hit (App Service throttles the site once exceeded).
3. You need to enable Always On for a warm-up routine or scheduled job.

Promotion is one parameter flip plus a re-apply:

```bash
az deployment group create \
  -g <rg-name> \
  -f infra/main.bicep \
  -p webAppName=<unique-app-name> \
     appServicePlanSku=B1
```

Note that promoting puts you above the $5/mo budget; the budget alert will
fire mid-month. Either raise `budgetAmount` (parameter) or accept the alert
as the explicit signal that a paid SKU is now in play.

---

## Required App Service application settings (set declaratively by Bicep)

These are populated by `infra/main.bicep` on `az deployment group create`.
They are **never** committed to the repo and **never** typed by hand into the
Azure Portal — Bicep is the source of truth so re-applying the template
restores intent.

| App setting | Value | Why |
| --- | --- | --- |
| `WEBSITE_RUN_FROM_PACKAGE` | `1` | Tells App Service Linux to run the app directly out of the deployed zip; gives an atomic swap on each deploy. |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` | Disables the SCM/Kudu post-deploy build step. The artifact is fully built in CI. |
| `ENABLE_ORYX_BUILD` | `false` | Disables Oryx server-side autodetect/build. Prevents F1 OOM during build and preserves the repo's `pnpm validate:content && next build` ordering. |
| `WEBSITES_PORT` | `8080` | Port the standalone Next server listens on; matches the `PORT` App Service injects. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | (Bicep output of the App Insights resource) | Enables Application Insights env-var instrumentation; no SDK code is added in this feature. |

---

## GitHub Actions setup

The deploy lane (`.github/workflows/deploy.yml`) runs on push to `main` and
on `workflow_dispatch`. It assumes the OIDC trust is already in place and
expects the values listed below as repo secrets/variables. Walk through this
once after the first `setup-oidc.sh` run, then forget about it — the
workflow consumes everything declaratively from then on.

1. **Create the GitHub environment.** In the repo, navigate to
   *Settings → Environments → New environment* and create one named
   `production`. The federated credential subject for `workflow_dispatch`
   runs is bound to `repo:<owner>/<repo>:environment:production`; if the
   environment doesn't exist, manual runs fail at `azure/login@v2` with a
   subject mismatch.

2. **Paste the OIDC values produced by `setup-oidc.sh` as secrets**
   (*Settings → Secrets and variables → Actions → New repository secret*).
   Setting them as repository-level secrets is fine; binding them to the
   `production` environment instead is also supported and slightly tighter:

   - `AZURE_CLIENT_ID` (secret)
   - `AZURE_TENANT_ID` (secret)
   - `AZURE_SUBSCRIPTION_ID` (secret)
   - `BUDGET_ALERT_EMAIL` (secret) — recipient address; required apply-time
     parameter for `infra/budget.bicep`. The deploy workflow does not consume
     it directly, but storing it here keeps every future budget re-apply
     idempotent without a fresh email lookup.

3. **Add the deploy targets as variables** (*New repository variable* on the
   same page):

   - `AZURE_RESOURCE_GROUP` (variable) — RG that hosts the App Service Plan
     and Web App (matches the third arg you passed to `setup-oidc.sh`).
   - `AZURE_WEBAPP_NAME` (variable) — the Web App name (matches the fourth
     arg you passed to `setup-oidc.sh`, and the `webAppName` parameter you
     passed to `az deployment group create`). The deploy workflow probes
     `https://${{ vars.AZURE_WEBAPP_NAME }}.azurewebsites.net/api/health`
     and `/en` after each deploy.

4. **Push to `main` (or trigger a manual `workflow_dispatch` run).** The
   workflow runs `pnpm validate:content && pnpm build`, packages the
   `.next/standalone` tree plus `.next/static` and `public` plus a minimal
   `package.json` stub into `app.zip`, deploys via `azure/webapps-deploy@v3`
   with `type: zip`, and then probes both `/api/health` (expecting JSON
   `{"status":"ok"}`) and `/en` (expecting HTML) with a ~60s retry budget
   to ride out F1 cold-start. A non-200 from either probe fails the run.

## Required GitHub-side secrets and variables (created out-of-band)

These are produced by `infra/setup-oidc.sh` and pasted into repo Settings →
Secrets and variables → Actions, scoped either as repository secrets or to
the `production` environment.

| Name | Kind | Source | Purpose |
| --- | --- | --- | --- |
| `AZURE_CLIENT_ID` | secret | output of `infra/setup-oidc.sh` | App Registration client id used by `azure/login@v2`. |
| `AZURE_TENANT_ID` | secret | output of `infra/setup-oidc.sh` | Azure AD tenant id. |
| `AZURE_SUBSCRIPTION_ID` | secret | output of `infra/setup-oidc.sh` | Subscription containing the resource group. |
| `AZURE_RESOURCE_GROUP` | variable | operator choice | Target RG name (e.g. `rg-movequest-prod`). |
| `AZURE_WEBAPP_NAME` | variable | Bicep `webAppName` parameter | Globally unique App Service site name. |
| `BUDGET_ALERT_EMAIL` | secret | operator choice | Recipient of the $5/mo Consumption Budget alert. Required apply-time parameter — there is no committed default. |

No Azure publish profiles, client secrets, or service-principal passwords
are ever stored. Auth is exclusively GitHub OIDC ↔ federated credential
bound to `repo:<owner>/<repo>:ref:refs/heads/main` (push) and
`repo:<owner>/<repo>:environment:production` (manual dispatch).

The operator must also create a GitHub environment named `production` so
the federated-credential subject for `workflow_dispatch` runs matches.

---

## Notes

- Region is fixed to `westeurope` for this feature; multi-region is out of
  scope.
- The repo never contains `.env` files for production. Runtime config flows
  through App Service application settings populated by Bicep.
- Custom domains, deployment slots, Key Vault, Docker/Container Apps,
  CDN/Front Door, App Gateway, autoscale, blue/green, and preview-PR
  environments are all explicitly out of scope. Each is its own future
  feature spec.
