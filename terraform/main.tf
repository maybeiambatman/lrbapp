terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    # Backend configuration will be provided via backend config file
    # bucket = "your-terraform-state-bucket"
    # prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required GCP APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "sqladmin.googleapis.com",           # Cloud SQL
    "run.googleapis.com",                # Cloud Run
    "vpcaccess.googleapis.com",          # VPC Access
    "secretmanager.googleapis.com",      # Secret Manager
    "cloudresourcemanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "compute.googleapis.com",
  ])
  
  service            = each.key
  disable_on_destroy = false
}

# VPC Network for private services
resource "google_compute_network" "vpc" {
  name                    = "${var.project_name}-vpc-${var.environment}"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.required_apis]
}

# Subnet for Cloud Run connector
resource "google_compute_subnetwork" "subnet" {
  name          = "${var.project_name}-subnet-${var.environment}"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc.id
}

# VPC Access Connector for Cloud Run to access Cloud SQL
resource "google_vpc_access_connector" "connector" {
  name          = "${var.project_name}-vpc-connector-${var.environment}"
  region        = var.region
  network       = google_compute_network.vpc.name
  ip_cidr_range = var.vpc_connector_cidr
  
  depends_on = [
    google_project_service.required_apis,
    google_compute_subnetwork.subnet
  ]
}

# Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "postgres" {
  name             = "${var.project_name}-db-${var.environment}"
  database_version = var.database_version
  region           = var.region
  
  settings {
    tier              = var.database_tier
    availability_type = "ZONAL"  # Always ZONAL for cost savings (REGIONAL doubles cost)
    disk_size         = var.database_disk_size
    disk_type         = var.environment == "prod" ? "PD_SSD" : "PD_HDD"  # HDD is cheaper for dev
    disk_autoresize   = false  # Disable autoresize to prevent surprise costs
    
    # Enable IAM database authentication
    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }
    
    backup_configuration {
      enabled                        = var.environment == "prod"  # Disable backups in dev to save cost
      point_in_time_recovery_enabled = var.environment == "prod"
      start_time                     = "03:00"
      transaction_log_retention_days = var.environment == "prod" ? 7 : 1
      backup_retention_settings {
        retained_backups = var.environment == "prod" ? 7 : 1
      }
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
    
    maintenance_window {
      day          = 7  # Sunday
      hour         = 3
      update_track = "stable"
    }
    
    # Query insights adds minor cost - disable in dev
    insights_config {
      query_insights_enabled  = var.environment == "prod"
      query_string_length     = 1024
      record_application_tags = false
      record_client_address   = false
    }
  }
  
  deletion_protection = var.environment == "prod"
  
  depends_on = [
    google_project_service.required_apis,
    google_service_networking_connection.private_vpc_connection
  ]
}

# Allocate IP range for private service connection
resource "google_compute_global_address" "private_ip_address" {
  name          = "${var.project_name}-private-ip-${var.environment}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
  
  depends_on = [google_project_service.required_apis]
}

# Private VPC connection for Cloud SQL
resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
  
  depends_on = [google_project_service.required_apis]
}

# Database
resource "google_sql_database" "database" {
  name     = var.database_name
  instance = google_sql_database_instance.postgres.name
}

# Retrieve database password from Secret Manager
data "google_secret_manager_secret_version" "db_password" {
  secret = var.database_password_secret
}

# Database user
resource "google_sql_user" "db_user" {
  name     = var.database_user
  instance = google_sql_database_instance.postgres.name
  password = data.google_secret_manager_secret_version.db_password.secret_data
}

# IAM database users (passwordless authentication via Google account)
resource "google_sql_user" "iam_users" {
  for_each = toset(var.iam_db_users)
  
  name     = each.value
  instance = google_sql_database_instance.postgres.name
  type     = "CLOUD_IAM_USER"
}

# IAM database groups (passwordless authentication via Google Group)
resource "google_sql_user" "iam_groups" {
  for_each = toset(var.iam_db_groups)
  
  name     = each.value
  instance = google_sql_database_instance.postgres.name
  type     = "CLOUD_IAM_GROUP"
}

# Grant IAM users the Cloud SQL Instance User role
resource "google_project_iam_member" "sql_instance_user" {
  for_each = toset(var.iam_db_users)
  
  project = var.project_id
  role    = "roles/cloudsql.instanceUser"
  member  = "user:${each.value}"
}

# Grant IAM groups the Cloud SQL Instance User role
resource "google_project_iam_member" "sql_instance_user_groups" {
  for_each = toset(var.iam_db_groups)
  
  project = var.project_id
  role    = "roles/cloudsql.instanceUser"
  member  = "group:${each.value}"
}

# Secret Manager for database URL
resource "google_secret_manager_secret" "database_url" {
  secret_id = "${var.project_name}-database-url-${var.environment}"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "database_url_version" {
  secret = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${google_sql_user.db_user.name}:${google_sql_user.db_user.password}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.database.name}?schema=public"
}

# Service account for Cloud Run
resource "google_service_account" "backend_service" {
  account_id   = "${var.project_name}-backend-${var.environment}"
  display_name = "Service Account for ${var.project_name} Backend ${var.environment}"
}

# Grant Cloud Run service account access to Secret Manager
resource "google_secret_manager_secret_iam_member" "backend_secret_access" {
  secret_id = google_secret_manager_secret.database_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend_service.email}"
}

# Grant Cloud Run service account Cloud SQL client role
resource "google_project_iam_member" "backend_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend_service.email}"
}

# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "backend" {
  location      = var.region
  repository_id = "${var.project_name}-backend-${var.environment}"
  format        = "DOCKER"
  
  depends_on = [google_project_service.required_apis]
}

# Cloud Run service for backend
resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.project_name}-backend-${var.environment}"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"
  
  template {
    service_account = google_service_account.backend_service.email
    
    containers {
      image = var.backend_image
      
      ports {
        container_port = 3001
      }
      
      env {
        name = "NODE_ENV"
        value = var.environment
      }
      
      env {
        name = "PORT"
        value = "3001"
      }
      
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }
      
      resources {
        limits = {
          cpu    = var.backend_cpu
          memory = var.backend_memory
        }
      }
    }
    
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
    
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }
  
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
  
  depends_on = [
    google_secret_manager_secret_version.database_url_version,
    google_project_iam_member.backend_cloudsql_client
  ]
}

# Allow unauthenticated access to Cloud Run service (adjust based on your needs)
resource "google_cloud_run_v2_service_iam_member" "backend_public_access" {
  count = var.allow_unauthenticated_access ? 1 : 0
  
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
