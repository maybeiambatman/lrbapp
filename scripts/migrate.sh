#!/bin/bash
set -e

# Database Migration Script for Cloud SQL
# Usage: ./migrate.sh [dev|prod]

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🔄 Running database migrations for $ENVIRONMENT environment"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|prod)$ ]]; then
    echo -e "${RED}Error: Environment must be 'dev' or 'prod'${NC}"
    exit 1
fi

# Check required tools
command -v gcloud >/dev/null 2>&1 || { echo -e "${RED}Error: gcloud CLI is required${NC}"; exit 1; }

# Get Terraform outputs
cd "$TERRAFORM_DIR"
terraform workspace select "$ENVIRONMENT" 2>/dev/null || {
    echo -e "${RED}Error: Terraform workspace '$ENVIRONMENT' not found. Run deploy.sh first.${NC}"
    exit 1
}

PROJECT_ID=$(grep 'project_id' "environments/$ENVIRONMENT/terraform.tfvars" | cut -d'"' -f2)
DB_INSTANCE=$(terraform output -raw database_instance_name)
DB_CONNECTION_NAME=$(terraform output -raw database_connection_name)

echo -e "${GREEN}Database Instance: $DB_INSTANCE${NC}"

# Get database credentials from Secret Manager
echo -e "\n${YELLOW}Fetching database credentials...${NC}"
DATABASE_URL=$(gcloud secrets versions access latest --secret="lrbapp-database-url-$ENVIRONMENT" --project="$PROJECT_ID")

# Start Cloud SQL Proxy
echo -e "\n${YELLOW}Starting Cloud SQL Proxy...${NC}"
cloud-sql-proxy "$DB_CONNECTION_NAME" --port=5433 &
PROXY_PID=$!

# Wait for proxy to be ready
sleep 5

# Function to cleanup
cleanup() {
    echo -e "\n${YELLOW}Stopping Cloud SQL Proxy...${NC}"
    kill $PROXY_PID 2>/dev/null || true
}
trap cleanup EXIT

# Run migrations
cd "$BACKEND_DIR"
echo -e "\n${YELLOW}Running Prisma migrations...${NC}"

# Use local proxy connection for migrations
LOCAL_DB_URL=$(echo "$DATABASE_URL" | sed "s/@[^:]*:5432/@localhost:5433/")
export DATABASE_URL="$LOCAL_DB_URL"

npx prisma migrate deploy

echo -e "\n${GREEN}✅ Migrations completed successfully!${NC}"

# Optional: Run seed
if [ "$ENVIRONMENT" = "dev" ]; then
    echo -e "\n${YELLOW}Would you like to seed the database? (yes/no)${NC}"
    read -r RUN_SEED
    
    if [ "$RUN_SEED" = "yes" ]; then
        echo -e "\n${YELLOW}Seeding database...${NC}"
        npm run db:seed
        echo -e "${GREEN}✅ Database seeded!${NC}"
    fi
fi
