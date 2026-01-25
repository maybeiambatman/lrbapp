# Deployment Troubleshooting

Common issues and solutions for GCP deployment.

## Authentication Issues

### "Application Default Credentials not found"

```bash
gcloud auth application-default login
```

### "Permission denied" errors

Verify your account has Editor or Owner role:
```bash
gcloud projects get-iam-policy YOUR-PROJECT-ID
```

### Check current authentication

```bash
gcloud auth list
gcloud config get-value project
```

## API Errors

### "API not enabled"

Enable the specific API:
```bash
gcloud services enable SERVICE-NAME.googleapis.com
```

Or enable all at once:
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

## Terraform Issues

### State Lock Error

If Terraform state is locked:
```bash
terraform force-unlock LOCK_ID
```

### State Bucket Access Denied

Verify bucket exists:
```bash
gsutil ls -p YOUR-PROJECT-ID
```

### Import Existing Resources

If resources were created manually:
```bash
terraform import google_sql_database_instance.postgres INSTANCE-NAME
```

### Drift Detection

Check for manual changes:
```bash
terraform plan -refresh-only -var-file="environments/dev/terraform.tfvars"
```

## Database Issues

### Can't Connect to Cloud SQL

1. **Check VPC connector status:**
   ```bash
   gcloud compute networks vpc-access connectors describe lrbapp-connector-dev \
     --region=us-central1
   ```

2. **Verify database is running:**
   ```bash
   gcloud sql instances describe lrbapp-db-dev
   ```

3. **Test with Cloud SQL Proxy:**
   ```bash
   cloud-sql-proxy YOUR-PROJECT:us-central1:lrbapp-db-dev --port=5433
   # In another terminal:
   psql "postgresql://lrbapp_user:PASSWORD@localhost:5433/lrbapp"
   ```

### Migration Fails

1. **Check migration status:**
   ```bash
   cd backend
   npx prisma migrate status
   ```

2. **Check for pending migrations:**
   ```bash
   ls -la prisma/migrations/
   ```

3. **Reset migrations (dev only!):**
   ```bash
   npx prisma migrate reset --force
   ```

## Cloud Run Issues

### Service Not Accessible

1. **Check service status:**
   ```bash
   gcloud run services describe lrbapp-backend-dev --region=us-central1
   ```

2. **Check if unauthenticated access is enabled:**
   ```bash
   gcloud run services get-iam-policy lrbapp-backend-dev --region=us-central1
   ```

3. **View logs for errors:**
   ```bash
   gcloud run services logs read lrbapp-backend-dev --region=us-central1 --limit=50
   ```

### Container Fails to Start

1. **Test build locally:**
   ```bash
   cd backend
   docker build -t test .
   docker run -p 3001:3001 -e DATABASE_URL="..." test
   ```

2. **Check container logs:**
   ```bash
   gcloud run services logs read lrbapp-backend-dev --region=us-central1
   ```

### Cold Start Too Slow

Increase minimum instances:
```hcl
# terraform.tfvars
min_instances = 1
```

## VPC Issues

### VPC Access Connector Creation Timeout

This is normal - VPC connectors can take 5-10 minutes. The Terraform apply will wait.

### Private IP Not Working

Verify service networking is set up:
```bash
gcloud compute addresses list --global
gcloud services vpc-peerings list --network=lrbapp-network-dev
```

## Docker Issues

### Build Fails

```bash
cd backend
docker build -t test . --progress=plain
```

### Push to Artifact Registry Fails

Configure Docker for Artifact Registry:
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

## Secret Manager Issues

### Secret Not Found

List available secrets:
```bash
gcloud secrets list
```

### Access Denied to Secret

Check IAM permissions:
```bash
gcloud secrets get-iam-policy SECRET-NAME
```

Grant access:
```bash
gcloud secrets add-iam-policy-binding SECRET-NAME \
  --member="serviceAccount:SERVICE-ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

## Script Issues

### deploy.sh Fails

1. **Run with debug:**
   ```bash
   bash -x ./scripts/deploy.sh dev
   ```

2. **Check prerequisites:**
   ```bash
   which gcloud terraform docker
   ```

3. **Verify configuration files exist:**
   ```bash
   ls terraform/environments/dev/
   # Should have: terraform.tfvars, backend.tfvars
   ```

## Getting Help

1. **Check GCP Console** for detailed error messages
2. **Review Terraform output** for specific errors
3. **Check API quotas** in GCP Console → IAM → Quotas
4. **View Cloud Run logs** in GCP Console → Cloud Run → Logs
