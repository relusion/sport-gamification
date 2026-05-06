#!/usr/bin/env bash
#
# One-time bootstrap for the GitHub Actions ↔ Azure OIDC trust used by
# .github/workflows/deploy.yml. The deploy workflow itself never runs this
# script — the workflow consumes the values it produces from GitHub
# secrets/variables (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`,
# `AZURE_SUBSCRIPTION_ID`).
#
# What this script provisions:
#   1. An Entra ID App Registration named `gh-deploy-<webapp-name>`.
#   2. Two federated credentials on the App Registration:
#        repo:<owner>/<repo>:ref:refs/heads/main         (push trigger)
#        repo:<owner>/<repo>:environment:production      (workflow_dispatch)
#   3. An RG-scoped Contributor role assignment for the App Registration's
#      Service Principal (no subscription-level perms).
#
# Re-run safety: each step checks the resource state before creating so the
# script is idempotent — re-runs after partial failure converge cleanly.
#
# Prerequisites: an operator signed in via `az login` who has at least
# Contributor on the target subscription PLUS User Access Administrator (or
# a custom role with Microsoft.Authorization/roleAssignments/write) on the
# target resource group, plus permission in Entra ID to create app
# registrations.
#
# Usage:
#   ./infra/setup-oidc.sh <github-owner> <github-repo> <resource-group> <webapp-name>
#
# Example:
#   ./infra/setup-oidc.sh acme movequest rg-movequest-prod movequest-prod-app

set -euo pipefail

usage() {
  echo "usage: $0 <github-owner> <github-repo> <resource-group> <webapp-name>" >&2
  exit 64
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then usage; fi
if [[ $# -ne 4 ]]; then usage; fi

GITHUB_OWNER="$1"
GITHUB_REPO="$2"
RESOURCE_GROUP="$3"
WEBAPP_NAME="$4"

APP_DISPLAY_NAME="gh-deploy-${WEBAPP_NAME}"
PUSH_CRED_NAME="github-push-main"
DISPATCH_CRED_NAME="github-environment-production"
GH_PUSH_SUBJECT="repo:${GITHUB_OWNER}/${GITHUB_REPO}:ref:refs/heads/main"
GH_DISPATCH_SUBJECT="repo:${GITHUB_OWNER}/${GITHUB_REPO}:environment:production"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: '$1' is required but not installed" >&2
    exit 127
  fi
}

require_command az
require_command jq

echo "==> Resolving subscription and tenant from current az context..."
SUBSCRIPTION_ID="$(az account show --query id -o tsv)"
TENANT_ID="$(az account show --query tenantId -o tsv)"
echo "    subscription: ${SUBSCRIPTION_ID}"
echo "    tenant:       ${TENANT_ID}"

echo "==> Verifying resource group exists: ${RESOURCE_GROUP}"
if ! az group show -n "${RESOURCE_GROUP}" >/dev/null 2>&1; then
  echo "error: resource group '${RESOURCE_GROUP}' not found in subscription ${SUBSCRIPTION_ID}" >&2
  echo "       create it first (e.g. az group create -n '${RESOURCE_GROUP}' -l westeurope)" >&2
  exit 1
fi

# Microsoft Graph has a brief replication lag (typically a few seconds, up
# to ~60s in the worst case) after `az ad app create` before the new app
# is readable by `az ad sp create` / `az ad app federated-credential ...`.
# Without polling, the very next call fails with a confusing
# `JSONDecodeError: Expecting value: line 1 column 1 (char 0)` because
# Graph returns an empty body during propagation. Poll until the app is
# queryable before continuing.
wait_for_app_in_graph() {
  local app_id="$1"
  local max_attempts=24       # 24 × 5s = 120s
  local attempt=0
  while (( attempt < max_attempts )); do
    if az ad app show --id "${app_id}" >/dev/null 2>&1; then
      return 0
    fi
    attempt=$((attempt + 1))
    if (( attempt == 1 )); then
      echo "    waiting for App Registration to propagate in Microsoft Graph..."
    fi
    sleep 5
  done
  echo "error: App Registration ${app_id} not visible in Graph after $((max_attempts * 5))s" >&2
  return 1
}

echo "==> Ensuring App Registration: ${APP_DISPLAY_NAME}"
APP_ID="$(az ad app list --display-name "${APP_DISPLAY_NAME}" --query '[0].appId' -o tsv 2>/dev/null || true)"
if [[ -z "${APP_ID}" ]]; then
  APP_ID="$(az ad app create --display-name "${APP_DISPLAY_NAME}" --query appId -o tsv)"
  echo "    created App Registration appId=${APP_ID}"
else
  echo "    found existing App Registration appId=${APP_ID}"
fi
wait_for_app_in_graph "${APP_ID}"

echo "==> Ensuring Service Principal for appId=${APP_ID}"
SP_OBJECT_ID="$(az ad sp list --filter "appId eq '${APP_ID}'" --query '[0].id' -o tsv 2>/dev/null || true)"
if [[ -z "${SP_OBJECT_ID}" ]]; then
  # Defense-in-depth retry: even after `az ad app show` returns OK,
  # Graph occasionally still 404s the very next `az ad sp create` from
  # a different region replica. Retry a handful of times with backoff.
  sp_create_attempts=6
  for ((sp_attempt = 1; sp_attempt <= sp_create_attempts; sp_attempt++)); do
    if SP_OBJECT_ID="$(az ad sp create --id "${APP_ID}" --query id -o tsv 2>/dev/null)" \
       && [[ -n "${SP_OBJECT_ID}" ]]; then
      break
    fi
    SP_OBJECT_ID=""
    if (( sp_attempt == sp_create_attempts )); then
      echo "error: az ad sp create --id ${APP_ID} failed after ${sp_create_attempts} attempts" >&2
      echo "       wait a minute and re-run; the script is idempotent" >&2
      exit 1
    fi
    echo "    sp create not ready (attempt ${sp_attempt}/${sp_create_attempts}); retrying after backoff..."
    sleep 10
  done
  echo "    created Service Principal objectId=${SP_OBJECT_ID}"
else
  echo "    found existing Service Principal objectId=${SP_OBJECT_ID}"
fi

ensure_federated_credential() {
  local cred_name="$1"
  local subject="$2"
  local existing
  existing="$(az ad app federated-credential list --id "${APP_ID}" \
    --query "[?name=='${cred_name}'].name" -o tsv 2>/dev/null || true)"
  if [[ -n "${existing}" ]]; then
    echo "    federated credential '${cred_name}' already present"
    return
  fi
  local payload
  payload="$(jq -n \
    --arg name "${cred_name}" \
    --arg issuer "https://token.actions.githubusercontent.com" \
    --arg subject "${subject}" \
    '{name: $name, issuer: $issuer, subject: $subject, audiences: ["api://AzureADTokenExchange"]}')"
  az ad app federated-credential create --id "${APP_ID}" --parameters "${payload}" >/dev/null
  echo "    created federated credential '${cred_name}' (subject: ${subject})"
}

echo "==> Ensuring federated credentials"
ensure_federated_credential "${PUSH_CRED_NAME}" "${GH_PUSH_SUBJECT}"
ensure_federated_credential "${DISPATCH_CRED_NAME}" "${GH_DISPATCH_SUBJECT}"

echo "==> Ensuring RG-scoped Contributor role assignment"
RG_SCOPE="/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}"
EXISTING_ROLE="$(az role assignment list \
  --assignee "${SP_OBJECT_ID}" \
  --role "Contributor" \
  --scope "${RG_SCOPE}" \
  --query '[0].id' -o tsv 2>/dev/null || true)"
if [[ -z "${EXISTING_ROLE}" ]]; then
  az role assignment create \
    --assignee-object-id "${SP_OBJECT_ID}" \
    --assignee-principal-type ServicePrincipal \
    --role "Contributor" \
    --scope "${RG_SCOPE}" >/dev/null
  echo "    granted Contributor on ${RG_SCOPE}"
else
  echo "    Contributor role assignment already in place"
fi

cat <<EOF

OIDC bootstrap complete. Copy the following into your GitHub repo's
Actions secrets (Settings → Secrets and variables → Actions):

  AZURE_CLIENT_ID=${APP_ID}
  AZURE_TENANT_ID=${TENANT_ID}
  AZURE_SUBSCRIPTION_ID=${SUBSCRIPTION_ID}

Variables (set as repository or environment 'production' variables):

  AZURE_RESOURCE_GROUP=${RESOURCE_GROUP}
  AZURE_WEBAPP_NAME=${WEBAPP_NAME}

Also set the secret BUDGET_ALERT_EMAIL to the recipient email used when
applying infra/budget.bicep at subscription scope.

Reminder: create a GitHub Environment named 'production' on the repo so
the federated credential subject for workflow_dispatch matches.
EOF
