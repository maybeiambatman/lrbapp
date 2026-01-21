# Deployment Scripts

Automated scripts for deploying LRBApp to Google Cloud Platform.

## Available Scripts

### deploy.sh

Main deployment script that handles the complete deployment pipeline.

**Usage:**
```bash
./scripts/deploy.sh [dev|prod]
```

**What it does:**
1. Validates environment and required tools
2. Builds Docker image with current git SHA tag
3. Pushes image to GCP Artifact Registry
4. Initializes Terraform with appropriate backend
5. Plans infrastructure changes
6. Applies changes (with confirmation)
7. Optionally runs database migrations

**Example:**
```bash
# Deploy to development
./scripts/deploy.sh dev

# Deploy to production
./scripts/deploy.sh prod
```

### migrate.sh

Runs Prisma database migrations against Cloud SQL.

**Usage:**
```bash
./scripts/migrate.sh [dev|prod]
```

**What it does:**
1. Connects to Cloud SQL via Cloud SQL Proxy
2. Retrieves database credentials from Secret Manager
3. Runs `prisma migrate deploy`
4. Optionally seeds database (dev only)

**Requirements:**
- Cloud SQL Proxy installed
- gcloud CLI authenticated
- Terraform infrastructure already deployed

**Example:**
```bash
# Run migrations on dev database
./scripts/migrate.sh dev
```

### destroy.sh

Destroys all infrastructure for an environment.

**Usage:**
```bash
./scripts/destroy.sh [dev|prod]
```

**⚠️ WARNING:** This permanently deletes:
- Cloud SQL database and all data
- Cloud Run service
- VPC network and connectors
- All secrets in Secret Manager
- Artifact Registry repositories

**Safety features:**
- Requires explicit confirmation
- Production environment requires typing "DESTROY-PROD"

**Example:**
```bash
# Destroy dev environment
./scripts/destroy.sh dev
```

## Prerequisites

All scripts require:
- `gcloud` CLI installed and authenticated
- `terraform` >= 1.5.0 installed
- `docker` installed
- Proper permissions on GCP project

Migration script additionally requires:
- `cloud-sql-proxy` installed
- `npm` for running Prisma commands

## Environment Configuration

Scripts read configuration from:
- `terraform/environments/{env}/terraform.tfvars`
- `terraform/environments/{env}/backend.tfvars`

Ensure these files are properly configured before running scripts.

## Script Behavior

### Color Output

Scripts use colored output for better readability:
- 🟢 Green: Success messages
- 🟡 Yellow: Informational/warning messages
- 🔴 Red: Error messages

### Error Handling

All scripts use `set -e` to exit immediately on any error. This prevents partial deployments.

### Confirmations

- Deploy script: Asks for confirmation before applying Terraform changes
- Migrate script: Asks before seeding database (dev only)
- Destroy script: Requires explicit confirmation, extra safety for prod

## Customization

To customize script behavior, edit the scripts directly. Common customizations:

### Change Docker Registry

Edit the `IMAGE_NAME` variable in `deploy.sh`:
```bash
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/my-custom-repo/backend"
```

### Skip Confirmation

For automated deployments, remove the confirmation prompts:
```bash
# In deploy.sh, replace:
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 0
fi

# With:
CONFIRM="yes"
```

### Custom Build Arguments

Add Docker build arguments in `deploy.sh`:
```bash
docker build \
  --build-arg NODE_ENV=production \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t "$FULL_IMAGE" \
  .
```

## Troubleshooting

### Script Permission Denied

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### gcloud Not Found

Install gcloud CLI:
```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
```

### Cloud SQL Proxy Connection Failed

Install Cloud SQL Proxy:
```bash
# Linux
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.2/cloud-sql-proxy.linux.amd64
chmod +x cloud-sql-proxy
sudo mv cloud-sql-proxy /usr/local/bin/

# macOS
brew install cloud-sql-proxy
```

### Terraform State Locked

If Terraform state is locked, force unlock:
```bash
cd terraform
terraform force-unlock LOCK_ID
```

### Docker Build Fails

Common causes:
- Missing dependencies in package.json
- TypeScript compilation errors
- Prisma schema issues

Check Docker build logs:
```bash
docker build --progress=plain ./backend
```

## Advanced Usage

### Deploy Specific Image

To deploy a specific Docker image tag:

```bash
# Edit deploy.sh to accept image tag parameter
# Or manually run Terraform with specific image
cd terraform
terraform apply \
  -var-file="environments/dev/terraform.tfvars" \
  -var="backend_image=REGISTRY/IMAGE:TAG"
```

### Parallel Deployments

Don't run scripts in parallel for the same environment (Terraform state locking will prevent this). However, you can deploy different environments simultaneously:

```bash
# Terminal 1
./scripts/deploy.sh dev

# Terminal 2
./scripts/deploy.sh prod
```

### Dry Run

To see what would happen without applying changes:

```bash
# In deploy.sh, replace the terraform apply line with:
terraform plan \
  -var-file="environments/$ENVIRONMENT/terraform.tfvars" \
  -var="backend_image=$IMAGE_NAME:latest"
# Then exit instead of applying
```

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines. See `.github/workflows/deploy.yml` for an example GitHub Actions workflow.

For other CI systems (GitLab, CircleCI, etc.), adapt the workflow structure while reusing these scripts.

## Best Practices

1. **Always review plan** - Check Terraform plan output before applying
2. **Tag images** - Use git SHA or semantic versioning for images
3. **Test in dev first** - Always deploy to dev before prod
4. **Backup before destroy** - Export database before running destroy
5. **Use workspaces** - Never mix environment state
6. **Monitor deployments** - Check Cloud Run logs after deployment

## Support

For issues with scripts:
1. Check script output for error messages
2. Verify prerequisites are installed
3. Ensure GCP authentication is valid
4. Review Terraform and Docker logs
5. Check GCP console for resource status
