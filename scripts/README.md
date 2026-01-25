# Deployment Scripts

Automated scripts for deploying LRBApp to Google Cloud Platform.

📖 **Full documentation:** [/docs/deployment/](../docs/deployment/index.md)

## Quick Reference

```bash
# Deploy to dev
./scripts/deploy.sh dev

# Run migrations
./scripts/migrate.sh dev

# Destroy environment (⚠️ deletes everything)
./scripts/destroy.sh dev
```

## Scripts

### deploy.sh

Builds, pushes, and deploys the backend to Cloud Run.

```bash
./scripts/deploy.sh [dev|prod]
```

**What it does:**
1. Builds Docker image with git SHA tag
2. Pushes to Artifact Registry
3. Runs Terraform plan/apply
4. Optionally runs migrations

### migrate.sh

Runs Prisma database migrations against Cloud SQL.

```bash
./scripts/migrate.sh [dev|prod]
```

**Requires:** Cloud SQL Proxy, Terraform infrastructure deployed

### destroy.sh

Destroys all infrastructure for an environment.

```bash
./scripts/destroy.sh [dev|prod]
```

⚠️ **Permanently deletes** database, Cloud Run, VPC, secrets

## Prerequisites

All tools are pre-installed in the dev container:
- gcloud CLI (authenticated)
- Terraform >= 1.5.0
- Docker
- Cloud SQL Proxy

## Configuration

Scripts read from:
- `terraform/environments/{env}/terraform.tfvars`
- `terraform/environments/{env}/backend.tfvars`

## Troubleshooting

**Permission denied:**
```bash
chmod +x scripts/*.sh
```

**Terraform state locked:**
```bash
cd terraform && terraform force-unlock LOCK_ID
```

**Docker build fails:**
```bash
cd backend && docker build --progress=plain .
```

See [Troubleshooting Guide](../docs/deployment/troubleshooting.md) for more.
