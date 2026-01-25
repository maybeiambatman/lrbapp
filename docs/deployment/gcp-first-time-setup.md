# First-Time GCP Setup

One-time setup steps to prepare GCP for deployment. **Only needed once per project.**

> **Note:** If you're using the dev container, gcloud CLI, Terraform, and Docker are already installed.

## Checklist

- [ ] GCP project created with billing enabled
- [ ] Authenticated to GCP
- [ ] Required APIs enabled
- [ ] Terraform state buckets created
- [ ] Configuration files created

## 1. Create GCP Project

```bash
# Create project (or use existing)
gcloud projects create YOUR-PROJECT-ID --name="LRBApp"

# Set as default
gcloud config set project YOUR-PROJECT-ID

# Enable billing (required for Cloud SQL)
# Do this in the GCP Console: https://console.cloud.google.com/billing
```

## 2. Authenticate

```bash
gcloud auth login
gcloud auth application-default login
```

## 3. Enable Required APIs

Run once to enable all required APIs:

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

## 4. Create Terraform State Buckets

Terraform stores state in GCS. Create buckets for each environment:

```bash
# Development
gsutil mb -p YOUR-PROJECT-ID -l us-central1 gs://YOUR-PROJECT-ID-terraform-state-dev
gsutil versioning set on gs://YOUR-PROJECT-ID-terraform-state-dev

# Production  
gsutil mb -p YOUR-PROJECT-ID -l us-central1 gs://YOUR-PROJECT-ID-terraform-state-prod
gsutil versioning set on gs://YOUR-PROJECT-ID-terraform-state-prod
```

## 5. Configure Terraform Variables

### Backend Configuration

Edit `terraform/environments/dev/backend.tfvars`:
```hcl
bucket = "YOUR-PROJECT-ID-terraform-state-dev"
prefix = "terraform/state/dev"
```

Edit `terraform/environments/prod/backend.tfvars`:
```hcl
bucket = "YOUR-PROJECT-ID-terraform-state-prod"
prefix = "terraform/state/prod"
```

### Environment Variables

Edit `terraform/environments/dev/terraform.tfvars`:
```hcl
project_id = "YOUR-PROJECT-ID"
environment = "dev"
region = "us-central1"

# Database
database_tier = "db-f1-micro"
database_disk_size = 10
database_password = "SECURE-PASSWORD"

# Cloud Run
backend_cpu = "1"
backend_memory = "512Mi"
min_instances = 0  # Scale to zero
max_instances = 5
```

Edit `terraform/environments/prod/terraform.tfvars`:
```hcl
project_id = "YOUR-PROJECT-ID"
environment = "prod"
region = "us-central1"

# Database (larger for production)
database_tier = "db-custom-2-7680"
database_disk_size = 100
database_password = "USE-SECRET-MANAGER"

# Cloud Run
backend_cpu = "2"
backend_memory = "2Gi"
min_instances = 1  # Always on
max_instances = 100
```

> ⚠️ **Important:** Don't commit `terraform.tfvars` or `backend.tfvars` - they're in `.gitignore`.

## 6. First Deployment

```bash
./scripts/deploy.sh dev
```

Verify in GCP Console:
- [ ] Cloud SQL instance running
- [ ] Cloud Run service deployed
- [ ] VPC network created
- [ ] Secret Manager has secrets

Test the deployment:
```bash
# Get URL
cd terraform && terraform output backend_url

# Test health
curl https://YOUR-BACKEND-URL/health
```

## Optional: CI/CD Setup

For GitHub Actions automated deployment:

### Create Service Account

```bash
# Create account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment"

# Grant editor role
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
  --member="serviceAccount:github-actions@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
  --role="roles/editor"

# Create key
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=github-actions@YOUR-PROJECT-ID.iam.gserviceaccount.com
```

### Add GitHub Secrets

In your GitHub repo → Settings → Secrets:

| Secret | Value |
|--------|-------|
| `GCP_SA_KEY` | Contents of `gcp-key.json` |
| `GCP_PROJECT_ID` | Your project ID |
| `GCP_REGION` | `us-central1` |
| `DATABASE_PASSWORD` | Database password |

Delete the local key file after adding to GitHub:
```bash
rm gcp-key.json
```

## Cost Estimates

### Development
- Cloud SQL (db-f1-micro): ~$7-15/month
- Cloud Run (scale to zero): ~$0-5/month
- Networking: ~$1/month
- **Total: ~$8-21/month**

### Production
- Cloud SQL (db-custom-2-7680): ~$120-180/month
- Cloud Run (min 1 instance): ~$30-50/month
- Networking: ~$5-10/month
- **Total: ~$155-240/month**

## Next Steps

- [Deployment Guide](index.md) - Regular deployment workflow
- [Troubleshooting](troubleshooting.md) - Common issues
