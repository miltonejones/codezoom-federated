terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-microfrontend-${var.environment}"
  location = var.location
  tags     = var.tags
}

# Random suffix for unique names
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Storage Account for build artifacts (optional, for CI/CD)
resource "azurerm_storage_account" "artifacts" {
  name                     = "stmfartifacts${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version         = "TLS1_2"

  tags = var.tags
}

# Storage Container for build outputs
resource "azurerm_storage_container" "builds" {
  name                  = "build-outputs"
  storage_account_name  = azurerm_storage_account.artifacts.name
  container_access_type = "private"
}

# Static Web Apps for each micro-frontend
resource "azurerm_static_web_app" "apps" {
  for_each = var.apps
  
  name                = "swa-${each.key}-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku_size           = var.environment == "prod" ? "Standard" : "Free"
  sku_tier           = var.environment == "prod" ? "Standard" : "Free"

  app_settings = {
    "APP_ENVIRONMENT" = var.environment
    "APP_NAME"        = each.key
    "API_BASE_URL"    = var.api_base_url
  }

  tags = var.tags
}

# CDN Profile for production (optional)
resource "azurerm_cdn_profile" "main" {
  count               = var.environment == "prod" ? 1 : 0
  name                = "cdn-microfrontend-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = "Global"
  sku                = "Standard_Microsoft"

  tags = var.tags
}

# CDN Endpoints for each app in production (optional)
resource "azurerm_cdn_endpoint" "apps" {
  for_each = var.environment == "prod" ? var.apps : {}
  
  name                = "cdn-${each.key}-${random_string.suffix.result}"
  profile_name        = azurerm_cdn_profile.main[0].name
  resource_group_name = azurerm_resource_group.main.name
  location            = "Global"
  is_http_allowed     = true
  is_https_allowed    = true
  origin_host_header  = azurerm_static_web_app.apps[each.key].default_host_name

  origin {
    name      = "origin"
    host_name = azurerm_static_web_app.apps[each.key].default_host_name
  }

  tags = var.tags
}