output "backend_url" {
  description = "URL of the deployed backend service"
  value       = google_cloud_run_v2_service.backend.uri
}

output "database_instance_name" {
  description = "Name of the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.name
}

output "database_connection_name" {
  description = "Connection name for Cloud SQL instance"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_private_ip" {
  description = "Private IP address of the database"
  value       = google_sql_database_instance.postgres.private_ip_address
  sensitive   = true
}

output "artifact_registry_url" {
  description = "URL of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.backend.repository_id}"
}

output "service_account_email" {
  description = "Email of the backend service account"
  value       = google_service_account.backend_service.email
}

output "vpc_connector_name" {
  description = "Name of the VPC connector"
  value       = google_vpc_access_connector.connector.name
}
