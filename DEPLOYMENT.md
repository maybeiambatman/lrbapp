# GCP Deployment Guide

This guide covers deploying the LRBApp backend to Google Cloud Platform using Terraform for infrastructure as code.

## Architecture Overview

The deployment uses the following GCP services:

- **Cloud SQL (PostgreSQL)**: Managed PostgreSQL database with automated backups
- **Cloud Run**: Serverless container platform for the backend API
- **VPC Network**: Private networking for secure database access
- **Secret Manager**: Secure storage for sensitive credentials
- **Artifact Registry**: Private Docker image repository
- **VPC Access Connector**: Enables Cloud Run to access Cloud SQL privately

## Prerequisites

### Required Tools

1. **gcloud CLI** - [Install Guide](https://cloud.google.com/sdk/docs/install)
2. **Terraform** (>= 1.5.0) - [Install Guide](https://developer.hashicorp.com/terraform/downloads)
3. **Docker** - [Install Guide](https://docs.docker.com/get-docker/)
4. **Cloud SQL Proxy** (for migrations) - [Install Guide](https://cloud.google.com/sql/docs/postgres/sql-proxy)

### GCP Account Setup

1. Create a GCP project:
   ```bash
   gcloud projects create YOUR-PROJECT-ID --name="LRBApp"
   ```

2. Enable billing for your project (required for Cloud SQL and other services)

3. Set default project:
   ```bash
   gcloud config set project YOUR-PROJECT-ID
   ```

4. Authenticate:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

### Required GCP APIs

The Terraform configuration automatically enables these APIs, but you can enable them manually:

```bash
gcloud services enable \
  sqladmin.googleapis.com \
  run.googleapis.com \
  vpcaccess.googleapis.com \
  secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com \
  servicenetworking.googleapis.com \
  compute.googleapis.com \
  artifactregistry.googleapis.com
```

## Initial Setup

### 1. Configure Terraform Backend

Create a GCS bucket for Terraform state:

```bash
# Create bucket for dev environment
gsutil mb -p YOUR-PROJECT-ID -l us-central1 gs://YOUR-PROJECT-ID-terraform-state-dev

# Enable versioning
gsutil versioning set on gs://YOUR-PROJECT-ID-terraform-state-dev

# For production
gsutil mb -p YOUR-PROJECT-ID -l us-central1 gs://YOUR-PROJECT-ID-terraform-state-prod
gsutil versioning set on gs://YOUR-PROJECT-ID-terraform-state-prod
```

Update the backend configuration files:

- `terraform/environments/dev/backend.tfvars`
- `terraform/environments/prod/backend.tfvars`

### 2. Configure Environment Variables

Update the `terraform.tfvars` files for each environment:

**Development** (`terraform/environments/dev/terraform.tfvars`):
```hcl
project_id = "YOUR-PROJECT-ID"
environment = "dev"
region = "us-central1"

# Database Configuration
database_tier = "db-f1-micro"  # Free tier eligible
database_disk_size = 10
database_password = "SECURE-PASSWORD-HERE"

# Cloud Run Configuration
backend_cpu = "1"
backend_memory = "512Mi"
min_instances = 0  # Scale to zero when not in use
max_instances = 5
allow_unauthenticated_access = true
```

**Production** (`terraform/environments/prod/terraform.tfvars`):
```hcl
project_id = "YOUR-PROJECT-ID"
environment = "prod"
region = "us-central1"

# Database Configuration
database_tier = "db-custom-2-7680"  # 2 vCPUs, 7.5GB RAM
database_disk_size = 100
database_password = "USE-SECRET-MANAGER-FOR-THIS"

# Cloud Run Configuration
backend_cpu = "2"
backend_memory = "2Gi"
min_instances = 1  # Always have at least one instance
max_instances = 100
allow_unauthenticated_access = true  # Set to false if using auth
```

### 3. Service Account for CI/CD (Optional)

For GitHub Actions deployment:

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
  --member="serviceAccount:github-actions@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
  --role="roles/editor"

# Create and download key
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=github-actions@YOUR-PROJECT-ID.iam.gserviceaccount.com

# Add to GitHub Secrets as GCP_SA_KEY
```

## Deployment Methods

### Method 1: Manual Deployment (Recommended for First Time)

Use the deployment script:

```bash
# Deploy to dev
./scripts/deploy.sh dev

# Deploy to prod
./scripts/deploy.sh prod
```

The script will:
1. Build and push Docker image to Artifact Registry
2. Initialize Terraform
3. Plan infrastructure changes
4. Apply changes (with confirmation)
5. Optionally run database migrations

### Method 2: Manual Terraform

```bash
cd terraform

# Initialize
terraform init -backend-config="environments/dev/backend.tfvars"

# Create/select workspace
terraform workspace new dev
terraform workspace select dev

# Plan
terraform plan \
  -var-file="environments/dev/terraform.tfvars" \
  -var="backend_image=YOUR-REGION-docker.pkg.dev/YOUR-PROJECT/lrbapp-backend-dev/backend:latest"

# Apply
terraform apply \
  -var-file="environments/dev/terraform.tfvars" \
  -var="backend_image=YOUR-REGION-docker.pkg.dev/YOUR-PROJECT/lrbapp-backend-dev/backend:latest"
```

### Method 3: GitHub Actions (Automated)

The workflow automatically deploys on push to:
- `develop` branch → dev environment
- `main` branch → prod environment

Required GitHub Secrets:
- `GCP_SA_KEY`: Service account key JSON
- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_REGION`: Deployment region (e.g., us-central1)
- `DATABASE_PASSWORD`: Database password

## Database Migrations

### Running Migrations

After deployment, run migrations using the script:

```bash
./scripts/migrate.sh dev
```

Or manually:

```bash
# Start Cloud SQL Proxy
cloud-sql-proxy YOUR-PROJECT:REGION:INSTANCE-NAME --port=5433 &

# Get database URL from Secret Manager
DATABASE_URL=$(gcloud secrets versions access latest \
  --secret="lrbapp-database-url-dev")

# Update to use local proxy
LOCAL_DB_URL=$(echo "$DATABASE_URL" | sed 's/@[^:]*:5432/@localhost:5433/')

# Run migrations
cd backend
DATABASE_URL="$LOCAL_DB_URL" npx prisma migrate deploy
```

### Creating New Migrations

Develop migrations locally, then deploy:

```bash
cd backend
npx prisma migrate dev --name descriptive_migration_name
```

Commit the new migration files and deploy.

## Monitoring and Maintenance

### View Logs

```bash
# Backend logs
gcloud run services logs read lrbapp-backend-dev \
  --project=YOUR-PROJECT-ID \
  --region=us-central1

# Database logs
gcloud sql operations list \
  --instance=lrbapp-db-dev \
  --project=YOUR-PROJECT-ID
```

### Access Database

```bash
# Using Cloud SQL Proxy
cloud-sql-proxy YOUR-PROJECT:REGION:INSTANCE-NAME

# Then connect with psql
psql "postgresql://lrbapp_user:PASSWORD@localhost:5432/lrbapp"
```

### View Metrics

- Cloud Run: https://console.cloud.google.com/run
- Cloud SQL: https://console.cloud.google.com/sql
- Monitoring: https://console.cloud.google.com/monitoring

## Cost Optimization

### Development Environment

- Uses `db-f1-micro` (free tier eligible shared CPU)
- Min instances = 0 (scale to zero)
- Small disk size (10GB)

Estimated cost: **$7-15/month** (primarily database)

### Production Environment

- Uses `db-custom-2-7680` (2 vCPU, 7.5GB RAM)
- Min instances = 1 (always running)
- Larger disk size (100GB)

Estimated cost: **$150-300/month** depending on traffic

### Cost Saving Tips

1. **Use Cloud SQL automated backups** instead of manual snapshots
2. **Enable query insights** to optimize slow queries
3. **Use Cloud Run min_instances=0** for dev to scale to zero
4. **Monitor with Cloud Monitoring** to detect anomalies
5. **Set up budget alerts** in GCP Console

## Troubleshooting

### Cloud Run Service Not Starting

Check logs:
```bash
gcloud run services logs read SERVICE-NAME --region=REGION
```

Common issues:
- Incorrect DATABASE_URL in Secret Manager
- VPC connector not properly configured
- Missing Prisma client generation

### Database Connection Issues

1. Verify VPC connector status:
   ```bash
   gcloud compute networks vpc-access connectors describe CONNECTOR-NAME \
     --region=REGION
   ```

2. Check Cloud SQL private IP:
   ```bash
   gcloud sql instances describe INSTANCE-NAME
   ```

3. Test connection with Cloud SQL Proxy:
   ```bash
   cloud-sql-proxy --port=5433 CONNECTION-NAME
   psql -h localhost -p 5433 -U lrbapp_user lrbapp
   ```

### Terraform State Issues

If state is corrupted or locked:

```bash
# Force unlock (use with caution)
terraform force-unlock LOCK-ID

# Import existing resource
terraform import google_sql_database_instance.postgres INSTANCE-NAME
```

## Security Best Practices

1. **Never commit secrets** - Use Secret Manager or GitHub Secrets
2. **Enable deletion protection** for production databases
3. **Use private IP** for database (no public IP)
4. **Rotate database credentials** regularly
5. **Enable Cloud Armor** for DDoS protection (if needed)
6. **Use IAM authentication** for service accounts
7. **Enable audit logging** for compliance

## Rollback Procedure

If deployment fails:

```bash
# Rollback to previous Cloud Run revision
gcloud run services update-traffic SERVICE-NAME \
  --to-revisions=PREVIOUS-REVISION=100 \
  --region=REGION

# Or rollback Terraform
terraform workspace select ENVIRONMENT
terraform apply -var-file="environments/ENVIRONMENT/terraform.tfvars" \
  -var="backend_image=PREVIOUS-IMAGE"
```

## Cleanup/Destroy

To destroy all infrastructure:

```bash
./scripts/destroy.sh dev
```

Or manually:
```bash
cd terraform
terraform workspace select dev
terraform destroy -var-file="environments/dev/terraform.tfvars"
```

**⚠️ WARNING**: This will permanently delete:
- Cloud SQL instance and all data
- Cloud Run service
- VPC network and connectors
- Secrets in Secret Manager

## Support and Resources

- [GCP Documentation](https://cloud.google.com/docs)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Prisma with Cloud SQL](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-google-cloud-run)
