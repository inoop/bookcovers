resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${local.prefix}/db-password"
  recovery_window_in_days = 7
  tags                    = { Name = "${local.prefix}-db-password" }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

resource "aws_secretsmanager_secret" "cognito_client_secret" {
  name                    = "${local.prefix}/cognito-client-secret"
  recovery_window_in_days = 7
  tags                    = { Name = "${local.prefix}-cognito-client-secret" }
}

resource "aws_secretsmanager_secret_version" "cognito_client_secret" {
  secret_id     = aws_secretsmanager_secret.cognito_client_secret.id
  secret_string = aws_cognito_user_pool_client.app.client_secret
}
