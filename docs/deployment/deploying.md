# Day-to-Day Deployment

Regular deployment tasks after initial setup is complete.

## Deploy Changes

### Using Script (Recommended)

```bash
# Deploy to dev
./scripts/deploy.sh dev

# Deploy to prod
./scripts/deploy.sh prod
```

### Using Terraform Directly

```bash
cd terraform

# Initialize (if switching environments)
terraform init -backend-config="environments/dev/backend.tfvars"

# Plan and review
terraform plan -var-file="environments/dev/terraform.tfvars"

# Apply
terraform apply -var-file="environments/dev/terraform.tfvars"
```

## Database Migrations

### Run Migrations

```bash
./scripts/migrate.sh dev
```

### Manual Migration (if script fails)

```bash
# Start Cloud SQL Proxy
cloud-sql-proxy YOUR-PROJECT:us-central1:lrbapp-db-dev --port=5433 &

# Get database URL
gcloud secrets versions access latest --secret="lrbapp-database-url-dev"

# Run migrations (update URL to use localhost:5433)
cd backend
DATABASE_URL="postgresql://lrbapp_user:PASSWORD@localhost:5433/lrbapp" npx prisma migrate deploy

# Stop proxy
kill %1
```

## View Deployment Status

### Backend URL

```bash
cd terraform
terraform output backend_url
```

### Service Status

```bash
gcloud run services describe lrbapp-backend-dev --region=us-central1
```

### View Logs

```bash
# Recent logs
gcloud run services logs read lrbapp-backend-dev --region=us-central1

# Stream logs
gcloud run services logs tail lrbapp-backend-dev --region=us-central1
```

### Database Status

```bash
gcloud sql instances describe lrbapp-db-dev
```

## Update Configuration

### Change Cloud Run Resources

Edit `terraform/environments/dev/terraform.tfvars`:
```hcl
backend_cpu = "2"
backend_memory = "1Gi"
min_instances = 1
max_instances = 10
```

Then redeploy:
```bash
./scripts/deploy.sh dev
```

### Update Database Password

```bash
# Create new secret version
echo -n "NEW_PASSWORD" | gcloud secrets versions add lrbapp-db-password-dev --data-file=-

# Force Cloud Run to pick up new secret
gcloud run services update lrbapp-backend-dev --region=us-central1 --no-traffic
```

## Switch Environments

```bash
cd terraform

# Switch to prod
terraform init -reconfigure -backend-config="environments/prod/backend.tfvars"
terraform workspace select prod || terraform workspace new prod

# Apply prod changes
terraform apply -var-file="environments/prod/terraform.tfvars"
```

## Rollback

### Rollback Cloud Run to Previous Revision

```bash
# List revisions
gcloud run revisions list --service=lrbapp-backend-dev --region=us-central1

# Route traffic to previous revision
gcloud run services update-traffic lrbapp-backend-dev \
  --region=us-central1 \
  --to-revisions=lrbapp-backend-dev-00001=100
```

### Rollback Database Migration

```bash
# This requires manual intervention - Prisma doesn't support automatic rollback
# You'll need to write a new migration to undo changes
```

## Destroy Environment

```bash
./scripts/destroy.sh dev
```

⚠️ **Warning:** This permanently deletes:
- Cloud SQL database and all data
- Cloud Run service
- VPC network and connectors
- All secrets in Secret Manager

Production requires typing `DESTROY-PROD` to confirm.

## IAM Database Access (Passwordless Login)

Allow team members to access Cloud SQL from GCP Console without a password.

### Add Users via Terraform (Recommended)

Edit `terraform/environments/dev/terraform.tfvars`:

```hcl
iam_db_users = [
  "developer@gmail.com",
  "admin@company.com"
]

# For Google Workspace groups (requires Cloud Identity)
iam_db_groups = [
  "dev-team@company.com"
]
```

Then apply:
```bash
./scripts/deploy.sh dev
```

### Grant Database Privileges

After adding IAM users, grant them database permissions:

```bash
# Connect via Cloud SQL Proxy
cloud-sql-proxy YOUR-PROJECT:us-central1:lrbapp-db-dev --port=5433 &

# Connect with admin user
psql "postgresql://lrbapp_user:PASSWORD@localhost:5433/lrbapp"
```

Run in psql:
```sql
-- Grant full access
GRANT ALL PRIVILEGES ON DATABASE lrbapp TO "developer@gmail.com";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "developer@gmail.com";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "developer@gmail.com";

-- Or read-only access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO "readonly@gmail.com";
```

### Connect from GCP Console

1. Go to **Cloud SQL** → your instance → **Cloud SQL Studio**
2. Select database: `lrbapp`
3. Select your IAM user
4. Leave password **blank**
5. Click **Authenticate** - uses your Google login

## CI/CD Deployment

Push to branch for automatic deployment:
- `develop` branch → dev environment
- `main` branch → prod environment

Or manually trigger in GitHub Actions → "Deploy to GCP" workflow.
