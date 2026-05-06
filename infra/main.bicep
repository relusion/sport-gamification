// Azure App Service deploy — RG-scoped resources for MoveQuest.
//
// Apply from infra/:
//   az deployment group create \
//     -g <rg-name> \
//     -f main.bicep \
//     -p webAppName=<unique-name>
//
// The subscription-scoped Consumption Budget lives in budget.bicep
// (sibling template) and is applied separately at sub scope.

@description('Azure region for all resources. Pinned to westeurope per the deploy spec; multi-region is out of scope.')
param location string = 'westeurope'

@description('Globally unique App Service name. Resolves to https://<name>.azurewebsites.net.')
@minLength(2)
@maxLength(60)
param webAppName string

@description('App Service Plan SKU. F1 (free) by default; promote to B1 only when cold-start latency or CPU minute cap becomes a problem.')
@allowed([
  'F1'
  'B1'
])
param appServicePlanSku string = 'B1'

@description('Linux App Service Plan name. Defaults to asp-<webAppName>.')
param appServicePlanName string = 'asp-${webAppName}'

@description('Application Insights resource name. Defaults to ai-<webAppName>.')
param appInsightsName string = 'ai-${webAppName}'

@description('Log Analytics workspace name. Defaults to law-<webAppName>.')
param logAnalyticsName string = 'law-${webAppName}'

@description('Diagnostic settings name on the Web App. Defaults to diag-<webAppName>.')
param diagnosticSettingsName string = 'diag-${webAppName}'

// ---------------------------------------------------------------------------
// Log Analytics + Application Insights (workspace-mode)
// ---------------------------------------------------------------------------

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ---------------------------------------------------------------------------
// Linux App Service Plan + Web App (Node 22 LTS, standalone server)
// ---------------------------------------------------------------------------

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  sku: {
    name: appServicePlanSku
  }
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      appCommandLine: 'node server.js'
      ftpsState: 'Disabled'
      http20Enabled: true
      minTlsVersion: '1.2'
      alwaysOn: appServicePlanSku == 'F1' ? false : true
      appSettings: [
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'false'
        }
        {
          name: 'WEBSITES_PORT'
          value: '8080'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
}

// ---------------------------------------------------------------------------
// Diagnostic settings — Web App logs/metrics → Log Analytics workspace
// ---------------------------------------------------------------------------

resource diagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: diagnosticSettingsName
  scope: webApp
  properties: {
    workspaceId: logAnalytics.id
    logs: [
      {
        category: 'AppServiceHTTPLogs'
        enabled: true
      }
      {
        category: 'AppServiceConsoleLogs'
        enabled: true
      }
      {
        category: 'AppServiceAppLogs'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
      }
    ]
  }
}

// ---------------------------------------------------------------------------
// Outputs — surfaced for the operator and downstream apply commands
// ---------------------------------------------------------------------------

@description('Default *.azurewebsites.net hostname of the deployed Web App.')
output webAppDefaultHostname string = webApp.properties.defaultHostName

@description('Application Insights connection string. Already wired as an App Service application setting; surfaced here for operator verification.')
output applicationInsightsConnectionString string = appInsights.properties.ConnectionString

@description('Log Analytics workspace resource id; used by operators when correlating diagnostic logs.')
output logAnalyticsWorkspaceId string = logAnalytics.id
