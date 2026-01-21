#!/bin/bash
set -e

# Terraform Destroy Script
# Usage: ./destroy.sh [dev|prod]

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"

echo "⚠️  DESTROYING infrastructure for $ENVIRONMENT environment"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|prod)$ ]]; then
    echo -e "${RED}Error: Environment must be 'dev' or 'prod'${NC}"
    exit 1
fi

# Extra confirmation for prod
if [ "$ENVIRONMENT" = "prod" ]; then
    echo -e "${RED}⚠️  WARNING: You are about to DESTROY the PRODUCTION environment!${NC}"
    echo -e "${YELLOW}Type 'DESTROY-PROD' to confirm:${NC}"
    read -r CONFIRM
    
    if [ "$CONFIRM" != "DESTROY-PROD" ]; then
        echo -e "${GREEN}Cancelled${NC}"
        exit 0
    fi
fi

cd "$TERRAFORM_DIR"
terraform workspace select "$ENVIRONMENT"

echo -e "\n${YELLOW}Planning destruction...${NC}"
terraform plan -destroy -var-file="environments/$ENVIRONMENT/terraform.tfvars"

echo -e "\n${RED}Are you sure you want to destroy all resources? (yes/no)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${GREEN}Cancelled${NC}"
    exit 0
fi

terraform destroy -var-file="environments/$ENVIRONMENT/terraform.tfvars" -auto-approve

echo -e "\n${GREEN}✅ Infrastructure destroyed${NC}"
