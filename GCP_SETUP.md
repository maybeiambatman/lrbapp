# GCP Setup Checklist

Complete these steps to prepare your GCP environment for deployment.

## ✅ Checklist

### 1. GCP Project Setup

- [ ] Create GCP project
  ```bash
  gcloud projects create YOUR-PROJECT-ID --name="LRBApp"
  ```
- [ ] Enable billing on the project
- [ ] Set as default project
  ```bash
  gcloud config set project YOUR-PROJECT-ID
  ```

### 2. Authentication

- [ ] Login to gcloud
  ```bash
  gcloud auth login
  gcloud auth application-default login
  ```

### 3. Enable Required APIs

Run this command to enable all required APIs:

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

Or enable individually:

- [ ] Cloud SQL Admin API
- [ ] Cloud Run API
- [ ] VPC Access API
- [ ] Secret Manager API
- [ ] Cloud Resource Manager API
- [ ] Service Networking API
- [ ] Compute Engine API
- [ ] Artifact Registry API

### 4. Create GCS Buckets for Terraform State

```bash
# Development
gsutil mb -p YOUR-PROJECT-ID -l us-central1 gs://YOUR-PROJECT-ID-terraform-state-dev
gsutil versioning set on gs://YOUR-PROJECT-ID-terraform-state-dev

# Production
gsutil mb -p YOUR-PROJECT-ID -l us-central1 gs://YOUR-PROJECT-ID-terraform-state-prod
gsutil versioning set on gs://YOUR-PROJECT-ID-terraform-state-prod
```

- [ ] Dev bucket created
- [ ] Prod bucket created
- [ ] Versioning enabled on both

### 5. Configure Terraform Variables

Edit `terraform/environments/dev/terraform.tfvars`:

- [ ] Set `project_id` to your GCP project ID
- [ ] Set `region` (default: us-central1)
- [ ] Set secure `database_password`

Edit `terraform/environments/prod/terraform.tfvars`:

- [ ] Set `project_id`
- [ ] Set `region`
- [ ] Set secure `database_password`
- [ ] Review resource sizing

### 6. Configure Terraform Backend

Edit `terraform/environments/dev/backend.tfvars`:

- [ ] Set `bucket` to your dev state bucket name

Edit `terraform/environments/prod/backend.tfvars`:

- [ ] Set `bucket` to your prod state bucket name

### 7. Service Account for CI/CD (Optional)

If using GitHub Actions:

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment"

# Grant roles
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
  --member="serviceAccount:github-actions@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
  --role="roles/editor"

# Create key
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=github-actions@YOUR-PROJECT-ID.iam.gserviceaccount.com
```

- [ ] Service account created
- [ ] Roles assigned
- [ ] Key downloaded
- [ ] Key added to GitHub Secrets as `GCP_SA_KEY`
- [ ] `GCP_PROJECT_ID` added to GitHub Secrets
- [ ] `GCP_REGION` added to GitHub Secrets
- [ ] `DATABASE_PASSWORD` added to GitHub Secrets

### 8. Install Local Tools

- [ ] gcloud CLI installed
- [ ] Terraform >= 1.5.0 installed
- [ ] Docker installed
- [ ] Cloud SQL Proxy installed (for migrations)

### 9. Initial Deployment

- [ ] Run first deployment: `./scripts/deploy.sh dev`
- [ ] Verify deployment in GCP Console
- [ ] Run migrations: `./scripts/migrate.sh dev`
- [ ] Test backend API endpoint

### 10. Verify Resources Created

In GCP Console, verify:

- [ ] Cloud SQL instance running
- [ ] Cloud Run service deployed
- [ ] VPC network created
- [ ] VPC Access Connector ready
- [ ] Secret Manager has database URL
- [ ] Artifact Registry repository exists

### 11. Test Deployment

```bash
# Get backend URL
cd terraform
terraform output backend_url

# Test health endpoint
curl https://YOUR-BACKEND-URL/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-01-21T..."}
```

### 12. Set Up Monitoring (Optional but Recommended)

- [ ] Set up uptime checks for backend
- [ ] Configure log-based alerts
- [ ] Set up budget alerts
- [ ] Create dashboard for key metrics

## Common Issues

### API Not Enabled Error

If you get "API not enabled" errors, manually enable the API:

```bash
gcloud services enable API-NAME.googleapis.com
```

### Insufficient Permissions

Ensure your user account has Project Editor or Owner role:

```bash
gcloud projects get-iam-policy YOUR-PROJECT-ID
```

### Terraform State Bucket Access Denied

Verify bucket exists and you have access:

```bash
gsutil ls -p YOUR-PROJECT-ID
```

### VPC Access Connector Creation Timeout

This is normal - VPC Access Connectors can take 5-10 minutes to create. The Terraform apply will wait.

## Next Steps

After completing this checklist:

1. Review [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide
2. Set up production environment
3. Configure custom domain (if needed)
4. Set up monitoring and alerting
5. Plan backup and disaster recovery strategy

## Cost Estimates

### Development Environment
- Cloud SQL (db-f1-micro): ~$7-15/month
- Cloud Run (scale to zero): ~$0-5/month
- Networking: ~$1/month
- **Total: ~$8-21/month**

### Production Environment
- Cloud SQL (db-custom-2-7680): ~$120-180/month
- Cloud Run (min 1 instance): ~$30-50/month
- Networking: ~$5-10/month
- **Total: ~$155-240/month**

Costs vary based on:
- Database usage and connections
- API request volume
- Data transfer
- Storage size

## Support

For issues during setup:

1. Check GCP Console for detailed error messages
2. Review Terraform output for specific errors
3. Verify all prerequisites are met
4. Ensure proper authentication
5. Check API quotas and limits

## Security Checklist

Before going to production:

- [ ] Review and update database passwords
- [ ] Enable Cloud Armor (if needed)
- [ ] Set up VPC Service Controls (for compliance)
- [ ] Configure Cloud IAM policies
- [ ] Enable audit logging
- [ ] Set up Secret Manager for all credentials
- [ ] Review firewall rules
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Review service account permissions
