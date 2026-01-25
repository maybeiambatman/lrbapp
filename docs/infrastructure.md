# Infrastructure Reference

Terraform configuration reference for GCP deployment.

## Overview

Infrastructure is defined in `/terraform` using Terraform. The configuration creates:

- **Cloud SQL PostgreSQL** - Managed database with private IP
- **Cloud Run** - Serverless container for backend API
- **VPC Network** - Private network for secure connectivity
- **VPC Access Connector** - Bridge between Cloud Run and Cloud SQL
- **Secret Manager** - Secure credential storage
- **Artifact Registry** - Docker image repository
- **Service Account** - Identity for Cloud Run service

## Directory Structure

```
terraform/
├── main.tf                    # Main configuration
├── variables.tf               # Variable definitions
├── outputs.tf                 # Output values
└── environments/
    ├── dev/
    │   ├── terraform.tfvars   # Dev values (not committed)
    │   ├── terraform.tfvars.example
    │   ├── backend.tfvars     # Dev backend (not committed)
    │   └── backend.tfvars.example
    └── prod/
        └── (same structure)
```

## Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `project_id` | GCP project ID | `my-project-123` |
| `environment` | Environment name | `dev` or `prod` |
| `region` | GCP region | `us-central1` |
| `database_password` | PostgreSQL password | (secure password) |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `database_tier` | `db-f1-micro` | Cloud SQL instance size |
| `database_disk_size` | `10` | Disk size in GB |
| `backend_cpu` | `1` | Cloud Run CPU |
| `backend_memory` | `512Mi` | Cloud Run memory |
| `min_instances` | `0` | Minimum Cloud Run instances |
| `max_instances` | `5` | Maximum Cloud Run instances |
| `subnet_cidr` | `10.0.0.0/24` | VPC subnet CIDR |
| `vpc_connector_cidr` | `10.8.0.0/28` | VPC connector CIDR |
| `allow_unauthenticated_access` | `true` | Allow public access |

## Workspaces

Terraform workspaces separate state for different environments:

```bash
# List workspaces
terraform workspace list

# Create/switch workspace
terraform workspace new staging
terraform workspace select prod
```

## State Management

State is stored in GCS buckets:

| Environment | Bucket |
|-------------|--------|
| dev | `gs://PROJECT-terraform-state-dev/terraform/state/dev` |
| prod | `gs://PROJECT-terraform-state-prod/terraform/state/prod` |

## Common Commands

### Initialize

```bash
cd terraform
terraform init -backend-config="environments/dev/backend.tfvars"
```

### Plan

```bash
terraform plan -var-file="environments/dev/terraform.tfvars"
```

### Apply

```bash
terraform apply -var-file="environments/dev/terraform.tfvars"
```

### Get Outputs

```bash
terraform output backend_url
terraform output database_connection_name
terraform output artifact_registry_url
```

### Switch Environments

```bash
terraform init -reconfigure -backend-config="environments/prod/backend.tfvars"
terraform workspace select prod
```

## Resource Sizing

### Development

Optimized for cost, scales to zero:

```hcl
database_tier     = "db-f1-micro"
database_disk_size = 10
backend_cpu       = "1"
backend_memory    = "512Mi"
min_instances     = 0
max_instances     = 5
```

### Production

High availability, always-on:

```hcl
database_tier      = "db-custom-2-7680"
database_disk_size = 100
backend_cpu        = "2"
backend_memory     = "2Gi"
min_instances      = 1
max_instances      = 100
```

## Security

- Database uses private IP (no public access)
- Credentials stored in Secret Manager
- VPC network isolates resources
- Service account with minimal permissions
- Deletion protection on prod database

## Best Practices

1. **Never commit secrets** - Use variables and Secret Manager
2. **Use workspaces** - Separate state per environment
3. **Plan before apply** - Always review changes
4. **Version providers** - Lock versions in `main.tf`
5. **Use remote backend** - Never store state locally

## Troubleshooting

### State Lock

```bash
terraform force-unlock LOCK_ID
```

### Import Existing Resources

```bash
terraform import google_sql_database_instance.postgres INSTANCE-NAME
```

### Drift Detection

```bash
terraform plan -refresh-only -var-file="environments/dev/terraform.tfvars"
```

### Upgrade Providers

```bash
terraform init -upgrade
```

## Resources

- [Terraform GCP Provider Docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [GCP Best Practices](https://cloud.google.com/docs/terraform/best-practices)
- [Terraform Workspaces](https://www.terraform.io/docs/language/state/workspaces.html)
