output "alb_dns_name" {
  description = "ALB DNS name — point your domain's A record here"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain for media assets"
  value       = aws_cloudfront_distribution.media.domain_name
}

output "ecr_repo_url" {
  description = "ECR repository URL for CI/CD image pushes"
  value       = aws_ecr_repository.backend.repository_url
}

output "cognito_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Cognito App Client ID"
  value       = aws_cognito_user_pool_client.app.id
}

output "cognito_hosted_ui_domain" {
  description = "Cognito hosted UI domain for auth flows"
  value       = "${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "ses_dkim_tokens" {
  description = "DKIM tokens — create CNAME records for each: <token>._domainkey.<domain>"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}

output "s3_media_bucket" {
  description = "S3 bucket name for media uploads"
  value       = aws_s3_bucket.media.bucket
}
