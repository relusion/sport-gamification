// $5/mo Consumption Budget for the MoveQuest deploy.
//
// Subscription-scoped — apply with:
//   az deployment sub create \
//     -l <location> \
//     -f budget.bicep \
//     -p budgetAlertEmail=<recipient@example.com>
//
// Email is delivered via the budget's `notifications.contactEmails` list.
// This satisfies the "email recipient on threshold breach" intent of the
// `cost-guard-required` constraint without provisioning a separate
// Microsoft.Insights/actionGroups resource (see spec.md § Spec Patches).

targetScope = 'subscription'

@description('Email recipient for the budget threshold alert. REQUIRED — no committed default so re-applying never quietly retargets alerts to a stale address.')
param budgetAlertEmail string

@description('Budget name. Defaults to movequest-budget.')
param budgetName string = 'movequest-budget'

@description('Monthly budget amount in USD. Locked at $5 by the cost-guard-required constraint; surfaced as a parameter so it can be raised post-promotion to B1 without forking the template.')
param budgetAmount int = 5

@description('First-of-the-month start date for the budget time window, in YYYY-MM-01 format. Defaults to the first day of the current UTC month.')
param budgetStartDate string = '${utcNow('yyyy-MM')}-01'

resource budget 'Microsoft.Consumption/budgets@2023-05-01' = {
  name: budgetName
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: budgetStartDate
    }
    notifications: {
      // 80% threshold: early warning. Operators can promote to B1 or
      // tighten cost before the budget is fully consumed.
      ActualCost_GreaterThan_80_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: [
          budgetAlertEmail
        ]
      }
      // 100% threshold: budget exceeded. Hard signal to investigate
      // (F1 should never come close — this fires only if SKU has been
      // promoted or an unexpected resource has been provisioned).
      ActualCost_GreaterThan_100_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Actual'
        contactEmails: [
          budgetAlertEmail
        ]
      }
    }
  }
}

@description('Resource id of the provisioned Consumption Budget.')
output budgetId string = budget.id
