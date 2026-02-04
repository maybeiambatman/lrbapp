variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "lrbapp"
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Network Configuration
variable "subnet_cidr" {
  description = "CIDR range for the subnet"
  type        = string
  default     = "10.0.0.0/24"
}

variable "vpc_connector_cidr" {
  description = "CIDR range for VPC connector (must be /28)"
  type        = string
  default     = "10.8.0.0/28"
}

# Database Configuration
variable "database_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "POSTGRES_15"
}

variable "database_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "database_disk_size" {
  description = "Database disk size in GB"
  type        = number
  default     = 10
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "lrbapp"
}

variable "database_user" {
  description = "Database user"
  type        = string
  default     = "lrbapp_user"
}

variable "database_password_secret" {
  description = "Name of the Secret Manager secret containing the database password"
  type        = string
  default     = "lrbapp-db-password"
}

# Cloud Run Configuration
variable "backend_image" {
  description = "Docker image for backend service"
  type        = string
  default     = "gcr.io/cloudrun/hello"  # Default placeholder
}

variable "backend_cpu" {
  description = "CPU allocation for backend"
  type        = string
  default     = "1"
}

variable "backend_memory" {
  description = "Memory allocation for backend (256Mi is minimum for Node.js)"
  type        = string
  default     = "256Mi"
}

variable "min_instances" {
  description = "Minimum number of Cloud Run instances (0 = scale to zero for cost savings)"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances (lower = less cost risk)"
  type        = number
  default     = 2
}

variable "allow_unauthenticated_access" {
  description = "Allow unauthenticated access to Cloud Run service"
  type        = bool
  default     = true
}

# IAM Database Authentication
variable "iam_db_users" {
  description = "List of IAM users (emails) to grant database access. Use full email for users."
  type        = list(string)
  default     = []
}

variable "iam_db_groups" {
  description = "List of IAM groups (emails) to grant database access. Requires Cloud Identity."
  type        = list(string)
  default     = []
}
