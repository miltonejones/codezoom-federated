# terraform/outputs.tf

output "static_web_apps" {
  description = "All deployed Static Web Apps"
  value = {
    for key, app in azurerm_static_web_app.apps :
    key => {
      name = app.name
      url  = "https://${app.default_host_name}"
    }
  }
}

output "resource_group_name" {
  description = "The name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "storage_account_name" {
  description = "The name of the storage account for artifacts"
  value       = azurerm_storage_account.artifacts.name
}

output "federation_endpoints" {
  description = "Federation endpoints for each app"
  value = {
    for key, app in azurerm_static_web_app.apps :
    key => "https://${app.default_host_name}/remoteEntry.json"
  }
}