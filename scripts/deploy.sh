#!/bin/bash
set -e

# GCP Deployment Script for LRBApp
# Usage: ./deploy.sh [dev|prod]

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🚀 Deploying LRBApp to GCP ($ENVIRONMENT environment)"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|prod)$ ]]; then
    echo -e "${RED}Error: Environment must be 'dev' or 'prod'${NC}"
    exit 1
fi

# Check required tools
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}Error: gcloud CLI is required but not installed${NC}"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo -e "${RED}Error: terraform is required but not installed${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Error: docker is required but not installed${NC}"; exit 1; }

# Load project configuration
cd "$TERRAFORM_DIR"
PROJECT_ID=$(grep 'project_id' "environments/$ENVIRONMENT/terraform.tfvars" | cut -d'"' -f2)
REGION=$(grep 'region' "environments/$ENVIRONMENT/terraform.tfvars" | cut -d'"' -f2)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
    echo -e "${RED}Error: Please configure project_id in terraform/environments/$ENVIRONMENT/terraform.tfvars${NC}"
    exit 1
fi

echo -e "${GREEN}Project ID: $PROJECT_ID${NC}"
echo -e "${GREEN}Region: $REGION${NC}"

# Set GCP project
echo -e "\n${YELLOW}Setting GCP project...${NC}"
gcloud config set project "$PROJECT_ID"

# Build and push Docker image
echo -e "\n${YELLOW}Building Docker image...${NC}"
cd "$BACKEND_DIR"

IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/lrbapp-backend-$ENVIRONMENT/backend"
IMAGE_TAG=$(git rev-parse --short HEAD || echo "latest")
FULL_IMAGE="$IMAGE_NAME:$IMAGE_TAG"

# Configure Docker authentication
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet

# Build the image
docker build -t "$FULL_IMAGE" -t "$IMAGE_NAME:latest" .

echo -e "\n${YELLOW}Pushing Docker image...${NC}"
docker push "$FULL_IMAGE"
docker push "$IMAGE_NAME:latest"

echo -e "${GREEN}Image pushed: $FULL_IMAGE${NC}"

# Initialize Terraform if needed
cd "$TERRAFORM_DIR"
if [ ! -d ".terraform" ]; then
    echo -e "\n${YELLOW}Initializing Terraform...${NC}"
    terraform init -backend-config="environments/$ENVIRONMENT/backend.tfvars"
else
    echo -e "\n${YELLOW}Updating Terraform...${NC}"
    terraform init -upgrade -backend-config="environments/$ENVIRONMENT/backend.tfvars"
fi

# Select workspace
terraform workspace select "$ENVIRONMENT" 2>/dev/null || terraform workspace new "$ENVIRONMENT"

# Plan infrastructure changes
echo -e "\n${YELLOW}Planning infrastructure changes...${NC}"
terraform plan \
    -var-file="environments/$ENVIRONMENT/terraform.tfvars" \
    -var="backend_image=$IMAGE_NAME:latest" \
    -out=tfplan

# Ask for confirmation
echo -e "\n${YELLOW}Do you want to apply these changes? (yes/no)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 0
fi

# Apply infrastructure changes
echo -e "\n${YELLOW}Applying infrastructure changes...${NC}"
terraform apply tfplan

# Get outputs
BACKEND_URL=$(terraform output -raw backend_url)
DB_INSTANCE=$(terraform output -raw database_instance_name)

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Backend URL: $BACKEND_URL${NC}"
echo -e "${GREEN}Database Instance: $DB_INSTANCE${NC}"

# Run database migrations
echo -e "\n${YELLOW}Would you like to run database migrations? (yes/no)${NC}"
read -r RUN_MIGRATIONS

if [ "$RUN_MIGRATIONS" = "yes" ]; then
    bash "$SCRIPT_DIR/migrate.sh" "$ENVIRONMENT"
fi

echo -e "\n${GREEN}🎉 All done!${NC}"
