# Terraform Configuration

This directory contains Infrastructure as Code (IaC) for deploying LRBApp to Google Cloud Platform.

## Structure

```
terraform/
├── main.tf              # Main Terraform configuration
├── variables.tf         # Variable definitions
├── outputs.tf          # Output values
└── environments/       # Environment-specific configs
    ├── dev/
    │   ├── terraform.tfvars   # Dev variables
    │   └── backend.tfvars     # Dev backend config
    └── prod/
        ├── terraform.tfvars   # Prod variables
        └── backend.tfvars     # Prod backend config
```

## Quick Start

### Prerequisites

- Terraform >= 1.5.0
- gcloud CLI authenticated
- GCS bucket for Terraform state

### Initialize

```bash
terraform init -backend-config="environments/dev/backend.tfvars"
```

### Deploy

```bash
# Select or create workspace
terraform workspace select dev || terraform workspace new dev

# Plan
terraform plan -var-file="environments/dev/terraform.tfvars"

# Apply
terraform apply -var-file="environments/dev/terraform.tfvars"
```

## Resources Created

- **Cloud SQL PostgreSQL**: Managed database with private IP
- **Cloud Run**: Serverless container for backend API
- **VPC Network**: Private network for secure connectivity
- **VPC Access Connector**: Bridge between Cloud Run and Cloud SQL
- **Secret Manager**: Secure credential storage
- **Artifact Registry**: Docker image repository
- **Service Account**: Identity for Cloud Run service

## Configuration

### Required Variables

Edit `environments/{env}/terraform.tfvars`:

- `project_id`: Your GCP project ID
- `environment`: Environment name (dev/prod)
- `region`: GCP region
- `database_password`: PostgreSQL password

### Optional Variables

See `variables.tf` for all available options:

- `database_tier`: Cloud SQL instance size
- `backend_cpu`: Cloud Run CPU allocation
- `backend_memory`: Cloud Run memory allocation
- `min_instances`: Minimum Cloud Run instances
- `max_instances`: Maximum Cloud Run instances

## Workspaces

Terraform workspaces separate state for different environments:

```bash
# List workspaces
terraform workspace list

# Create new workspace
terraform workspace new staging

# Switch workspace
terraform workspace select prod
```

## State Management

Terraform state is stored in GCS buckets:

- Dev: `gs://YOUR-PROJECT-terraform-state-dev/terraform/state/dev`
- Prod: `gs://YOUR-PROJECT-terraform-state-prod/terraform/state/prod`

## Outputs

After applying, get output values:

```bash
terraform output backend_url
terraform output database_connection_name
terraform output artifact_registry_url
```

## Modules

The configuration is monolithic for simplicity. For larger deployments, consider splitting into modules:

```
terraform/
├── modules/
│   ├── networking/
│   ├── database/
│   └── compute/
└── environments/
```

## Best Practices

1. **Never commit secrets** - Use variables and external secret management
2. **Use workspaces** - Separate state per environment
3. **Enable state locking** - GCS backend includes locking
4. **Version providers** - Lock provider versions for consistency
5. **Plan before apply** - Always review changes
6. **Use remote backend** - Never store state locally for production

## Troubleshooting

### State Lock

If Terraform state is locked:

```bash
terraform force-unlock LOCK_ID
```

### Import Existing Resources

If resources were created outside Terraform:

```bash
terraform import google_sql_database_instance.postgres INSTANCE-NAME
```

### Drift Detection

Check for manual changes:

```bash
terraform plan -refresh-only
```

## Upgrading

To upgrade Terraform or providers:

```bash
terraform init -upgrade
```

## Resources

- [Terraform GCP Provider Docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [GCP Best Practices](https://cloud.google.com/docs/terraform/best-practices)
- [Terraform Workspaces](https://www.terraform.io/docs/language/state/workspaces.html)
