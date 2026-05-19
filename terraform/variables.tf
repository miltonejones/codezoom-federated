variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus2"
}

variable "api_base_url" {
  description = "Base URL for backend API"
  type        = string
  default     = "https://b8j6vj57oe.execute-api.us-east-1.amazonaws.com"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Environment = "development"
    Project     = "microfrontend-app"
    ManagedBy   = "terraform"
  }
}

variable "apps" {
  description = "Micro-frontend applications configuration"
  type = map(object({
    port            = number
    source_path     = string
    build_command   = string
    output_path     = string
    app_name        = string
  }))
  default = {
    "app-host" = {
      port          = 4200
      source_path   = "../app-host"
      build_command = "npm run build:host -- --configuration=production"
      output_path   = "../dist/app-host"
      app_name      = "host"
    }
    "app-list" = {
      port          = 4201
      source_path   = "../app-list"
      build_command = "npm run build:list -- --configuration=production"
      output_path   = "../dist/app-list"
      app_name      = "list"
    }
    "app-workspace" = {
      port          = 4203
      source_path   = "../app-workspace"
      build_command = "npm run build:workspace -- --configuration=production"
      output_path   = "../dist/app-workspace"
      app_name      = "workspace"
    }
  }
}

variable "custom_domains" {
  description = "Custom domains for each app"
  type = map(object({
    host_name = string
    validation_token = string
  }))
  default = {}
}