# Deployment Guide

Deploy the Golf Trip Manager to Google Cloud Platform.

## Overview

The app deploys to GCP using:

| Service | Purpose |
|---------|---------|
| **Cloud Run** | Serverless backend API |
| **Cloud SQL** | Managed PostgreSQL database |
| **VPC Network** | Private networking |
| **Secret Manager** | Credential storage |
| **Artifact Registry** | Docker image storage |

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Cloud Run  │────▶│  Cloud SQL  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ VPC Network │
                    └─────────────┘
```

## Quick Start

Already have GCP set up? Deploy in one command:

```bash
./scripts/deploy.sh dev
```

First time? Follow the [First-Time GCP Setup](gcp-first-time-setup.md) guide.

## Available Environments

| Environment | Branch | Cost Estimate |
|-------------|--------|---------------|
| dev | develop | ~$8-21/month (scales to zero) |
| prod | main | ~$155-240/month |

## Deployment Methods

### 1. Script Deployment (Recommended)

```bash
# Deploy to dev
./scripts/deploy.sh dev

# Deploy to prod
./scripts/deploy.sh prod
```

The script handles:
1. Building and pushing Docker image
2. Running Terraform
3. Optional database migrations

### 2. Manual Terraform

```bash
cd terraform

# Initialize
terraform init -backend-config="environments/dev/backend.tfvars"

# Plan
terraform plan -var-file="environments/dev/terraform.tfvars"

# Apply
terraform apply -var-file="environments/dev/terraform.tfvars"
```

### 3. GitHub Actions (CI/CD)

Push to branch for automatic deployment:
- `develop` → deploys to dev
- `main` → deploys to prod

Required GitHub Secrets:
- `GCP_SA_KEY` - Service account key JSON
- `GCP_PROJECT_ID` - Your GCP project ID
- `GCP_REGION` - Deployment region

## Database Migrations

After deployment, run migrations:

```bash
./scripts/migrate.sh dev
```

Or manually:
```bash
# Start Cloud SQL Proxy
cloud-sql-proxy PROJECT:REGION:INSTANCE --port=5433 &

# Run migrations
cd backend
DATABASE_URL="postgresql://user:pass@localhost:5433/lrbapp" npx prisma migrate deploy
```

## Common Tasks

### View Backend URL

```bash
cd terraform
terraform output backend_url
```

### View Logs

```bash
gcloud run services logs read lrbapp-backend-dev --region=us-central1
```

### Test Deployment

```bash
curl https://YOUR-BACKEND-URL/health
```

### Destroy Environment

```bash
./scripts/destroy.sh dev
```

⚠️ This permanently deletes all resources and data.

## Next Steps

- [First-Time GCP Setup](gcp-first-time-setup.md) - One-time setup steps
- [Day-to-Day Deployment](deploying.md) - Regular deployment tasks
- [Troubleshooting](troubleshooting.md) - Common issues and fixes
- [Infrastructure Reference](../infrastructure.md) - Terraform details
