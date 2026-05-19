#!/bin/bash
# deploy.sh - Using SWA CLI for deployment

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

ENVIRONMENT=${1:-dev}
RESOURCE_GROUP="rg-microfrontend-${ENVIRONMENT}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying Micro-Frontends to ${ENVIRONMENT} environment${NC}"
echo "======================================================"

# Check if SWA CLI is installed
if ! command -v swa &> /dev/null; then
    echo -e "${RED}❌ SWA CLI is not installed. Please install it first:${NC}"
    echo "  npm install -g @azure/static-web-apps-cli"
    exit 1
fi

cd "$SCRIPT_DIR"

# Get app names and deployment tokens
echo -e "\n${YELLOW}📋 Getting app information and deployment tokens...${NC}"

HOST_NAME=$(terraform output -json | jq -r '.static_web_apps.value."app-host".name')
LIST_NAME=$(terraform output -json | jq -r '.static_web_apps.value."app-list".name')
WORKSPACE_NAME=$(terraform output -json | jq -r '.static_web_apps.value."app-workspace".name')

HOST_TOKEN=$(az staticwebapp secrets list --name $HOST_NAME --resource-group $RESOURCE_GROUP --query properties.apiKey -o tsv)
LIST_TOKEN=$(az staticwebapp secrets list --name $LIST_NAME --resource-group $RESOURCE_GROUP --query properties.apiKey -o tsv)
WORKSPACE_TOKEN=$(az staticwebapp secrets list --name $WORKSPACE_NAME --resource-group $RESOURCE_GROUP --query properties.apiKey -o tsv)

# Build apps
echo -e "\n${YELLOW}🔨 Building applications...${NC}"
cd "$REPO_ROOT"

# for app in app-host app-list app-workspace; do
#     if [ -d "$app" ]; then
#         echo "Building $app..."
#         cd "$app"
#         npm run build -- --configuration=production 2>/dev/null || npm run build
#         cd "$REPO_ROOT"
#     fi
# done'

echo $HOST_TOKEN

# Deploy function using SWA CLI
deploy_app() {
    local app_name=$1
    local app_display=$2
    local token=$3
    
    local source_path="$REPO_ROOT/$app_display/dist/$app_display/browser"
    
    if [ ! -d "$source_path" ]; then
        echo -e "${RED}❌ Build not found at $source_path${NC}"
        return 1
    fi
    
    echo -e "\n${BLUE}📤 Deploying $app_display...${NC}"
    echo "   Source: $source_path"
    
    swa deploy \
        --deployment-token "$token" \
        --env production \
        --app-name "$app_name" \
        --resource-group "$RESOURCE_GROUP" \
        --app-location "$source_path" \
        --verbose
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $app_display deployed successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to deploy $app_display${NC}"
        return 1
    fi
}

deploy_app "$HOST_NAME" "app-host" "$HOST_TOKEN"
deploy_app "$LIST_NAME" "app-list" "$LIST_TOKEN"
deploy_app "$WORKSPACE_NAME" "app-workspace" "$WORKSPACE_TOKEN"

echo -e "\n${GREEN}======================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}======================================${NC}"