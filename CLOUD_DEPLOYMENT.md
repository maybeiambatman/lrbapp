# Cloud Deployment Setup - Quick Start

This branch contains a complete GCP deployment setup for the LRBApp using Terraform and automated deployment scripts.

## 🎯 What's Included

### Infrastructure as Code (Terraform)
- **Cloud SQL PostgreSQL**: Managed database with automated backups
- **Cloud Run**: Serverless container deployment
- **VPC Network**: Secure private networking
- **Secret Manager**: Credential management
- **Artifact Registry**: Docker image storage

### Deployment Automation
- Bash scripts for easy deployment
- GitHub Actions CI/CD pipeline
- Database migration automation
- Production-ready Docker configuration

### Documentation
- Complete setup guide
- Deployment procedures
- Troubleshooting guides
- Cost estimates

## 🚀 Quick Start

### 1. Prerequisites

Install required tools:
```bash
# gcloud CLI
curl https://sdk.cloud.google.com | bash

# Terraform
brew install terraform  # macOS
# or download from https://terraform.io

# Docker
# Install from https://docker.com

# Cloud SQL Proxy (for migrations)
brew install cloud-sql-proxy  # macOS
```

### 2. GCP Setup

Follow the complete checklist in [GCP_SETUP.md](GCP_SETUP.md):

```bash
# Create project
gcloud projects create YOUR-PROJECT-ID --name="LRBApp"

# Enable billing and set default project
gcloud config set project YOUR-PROJECT-ID

# Enable required APIs
gcloud services enable \
  sqladmin.googleapis.com \
  run.googleapis.com \
  vpcaccess.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com

# Create Terraform state buckets
gsutil mb -p YOUR-PROJECT-ID gs://YOUR-PROJECT-ID-terraform-state-dev
gsutil versioning set on gs://YOUR-PROJECT-ID-terraform-state-dev
```

### 3. Configure Terraform

Edit `terraform/environments/dev/terraform.tfvars`:
```hcl
project_id = "YOUR-PROJECT-ID"
environment = "dev"
region = "us-central1"
database_password = "your-secure-password"
```

Edit `terraform/environments/dev/backend.tfvars`:
```hcl
bucket = "YOUR-PROJECT-ID-terraform-state-dev"
prefix = "terraform/state/dev"
```

### 4. Deploy

```bash
# Deploy to development
./scripts/deploy.sh dev

# Run database migrations
./scripts/migrate.sh dev

# Test the deployment
curl https://YOUR-BACKEND-URL/health
```

## 📁 File Structure

```
.
├── terraform/                  # Infrastructure as Code
│   ├── main.tf                # Main Terraform configuration
│   ├── variables.tf           # Variable definitions
│   ├── outputs.tf             # Output values
│   └── environments/          # Environment-specific configs
│       ├── dev/
│       │   ├── terraform.tfvars
│       │   └── backend.tfvars
│       └── prod/
│
├── scripts/                    # Deployment automation
│   ├── deploy.sh              # Main deployment script
│   ├── migrate.sh             # Database migration script
│   └── destroy.sh             # Cleanup script
│
├── .github/workflows/         # CI/CD pipelines
│   └── deploy.yml             # Automated deployment workflow
│
├── backend/
│   ├── Dockerfile             # Production-optimized container
│   └── .dockerignore          # Docker build exclusions
│
├── DEPLOYMENT.md              # Comprehensive deployment guide
├── GCP_SETUP.md              # Step-by-step GCP setup
└── CLOUD_DEPLOYMENT.md       # This file
```

## 🔧 Key Features

### Multi-Environment Support
- **Dev**: Cost-optimized, scales to zero
- **Prod**: High availability, always-on

### Security
- Private database access (no public IP)
- VPC networking
- Secret Manager for credentials
- IAM-based authentication
- Non-root container user

### CI/CD
- Automated deployment via GitHub Actions
- Push to `develop` → deploys to dev
- Push to `main` → deploys to prod
- Automatic database migrations

### Cost Optimization
- **Dev**: ~$8-21/month (scale to zero)
- **Prod**: ~$155-240/month (based on usage)

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [GCP_SETUP.md](GCP_SETUP.md) | Complete setup checklist with commands |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Detailed deployment procedures and troubleshooting |
| [terraform/README.md](terraform/README.md) | Terraform configuration guide |
| [scripts/README.md](scripts/README.md) | Deployment script documentation |

## 🔄 Deployment Workflow

### Manual Deployment
```bash
./scripts/deploy.sh dev
```

This script:
1. ✅ Validates prerequisites
2. 🏗️ Builds Docker image
3. 📦 Pushes to Artifact Registry
4. 🔧 Plans infrastructure changes
5. 🚀 Applies Terraform changes
6. 🗄️ Optionally runs migrations

### Automated Deployment (GitHub Actions)

Push to branch:
- `develop` → deploys to dev automatically
- `main` → deploys to prod automatically

Or manually trigger:
- Go to Actions tab in GitHub
- Select "Deploy to GCP" workflow
- Choose environment and run

## 🎯 Next Steps

1. **Complete GCP Setup**: Follow [GCP_SETUP.md](GCP_SETUP.md)
2. **First Deployment**: Run `./scripts/deploy.sh dev`
3. **Set Up CI/CD**: Add GitHub Secrets for automated deployment
4. **Test Backend**: Verify API endpoints work
5. **Deploy Frontend**: Configure frontend to use backend URL
6. **Monitor**: Set up logging and monitoring in GCP Console
7. **Production**: Configure prod environment and deploy

## 🛠️ Common Tasks

### View Backend URL
```bash
cd terraform
terraform output backend_url
```

### View Logs
```bash
gcloud run services logs read lrbapp-backend-dev \
  --region=us-central1
```

### Run Migrations
```bash
./scripts/migrate.sh dev
```

### Update Configuration
```bash
# Edit terraform.tfvars
vim terraform/environments/dev/terraform.tfvars

# Redeploy
./scripts/deploy.sh dev
```

### Destroy Environment
```bash
./scripts/destroy.sh dev
```

## 🐛 Troubleshooting

### Deployment Fails
1. Check script output for errors
2. Verify GCP authentication: `gcloud auth list`
3. Ensure APIs are enabled
4. Review Terraform logs

### Database Connection Issues
1. Check VPC connector status in GCP Console
2. Verify Secret Manager has correct DATABASE_URL
3. Test with Cloud SQL Proxy locally

### Image Build Fails
```bash
# Test Docker build locally
cd backend
docker build -t test .
```

## 💰 Cost Management

### Development
- Scale to zero when not in use
- Use db-f1-micro (free tier eligible)
- Cost: ~$8-21/month

### Production
- Right-size instances based on load
- Enable query insights to optimize
- Set up budget alerts
- Cost: ~$155-240/month

## 🔒 Security Checklist

- [ ] Rotate database passwords regularly
- [ ] Review IAM permissions
- [ ] Enable audit logging
- [ ] Set up Cloud Armor (if needed)
- [ ] Configure CORS properly
- [ ] Use HTTPS only
- [ ] Enable deletion protection on prod database

## 📊 Monitoring

### GCP Console Links
- Cloud Run: https://console.cloud.google.com/run
- Cloud SQL: https://console.cloud.google.com/sql
- Logs: https://console.cloud.google.com/logs
- Monitoring: https://console.cloud.google.com/monitoring

### Set Up Alerts
1. Uptime checks for backend
2. Database connection alerts
3. Error rate alerts
4. Budget alerts

## 🤝 Contributing

When making changes to infrastructure:

1. Test in dev environment first
2. Update Terraform configurations
3. Update documentation
4. Deploy and verify
5. Promote to prod

## 📞 Support

For deployment issues:
- Review [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
- Check GCP Console for detailed errors
- Review Terraform and script logs
- Verify prerequisites are installed

## 🎉 Success!

Once deployed, you should see:
- Backend API running on Cloud Run
- Database accessible via Cloud SQL
- Automated backups configured
- Secure networking in place
- CI/CD pipeline ready

Test your deployment:
```bash
BACKEND_URL=$(cd terraform && terraform output -raw backend_url)
curl $BACKEND_URL/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-01-21T..."}
```

You're now ready to deploy your golf trip management app to production! 🏌️‍♂️
