# Terraform Configuration

Infrastructure as Code for deploying LRBApp to Google Cloud Platform.

📖 **Full documentation:** [/docs/deployment/](../docs/deployment/index.md) | [Infrastructure Reference](../docs/infrastructure.md)

## Quick Reference

```bash
cd terraform

# Initialize
terraform init -backend-config="environments/dev/backend.tfvars"

# Plan
terraform plan -var-file="environments/dev/terraform.tfvars"

# Apply
terraform apply -var-file="environments/dev/terraform.tfvars"

# Get outputs
terraform output backend_url
```

## Structure

```
terraform/
├── main.tf              # Main configuration
├── variables.tf         # Variable definitions
├── outputs.tf           # Output values
└── environments/
    ├── dev/
    │   ├── terraform.tfvars   # Dev values (not committed)
    │   └── backend.tfvars     # Dev backend (not committed)
    └── prod/
```

## Resources Created

| Resource | Purpose |
|----------|---------|
| Cloud SQL PostgreSQL | Managed database |
| Cloud Run | Backend API container |
| VPC Network | Private networking |
| VPC Access Connector | Cloud Run → Cloud SQL |
| Secret Manager | Credential storage |
| Artifact Registry | Docker images |

## Configuration

Edit `environments/{env}/terraform.tfvars`:

```hcl
project_id        = "your-project-id"
environment       = "dev"
region            = "us-central1"
database_password = "secure-password"
```

See [variables.tf](variables.tf) for all options.

## First-Time Setup

See [First-Time GCP Setup](../docs/deployment/gcp-first-time-setup.md) for:
- Creating GCS state buckets
- Enabling required APIs
- Creating configuration files

