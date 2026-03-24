resource "aws_ses_domain_identity" "main" {
  domain = var.domain_name
}

resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Output DKIM tokens so DNS records can be created
# Add these as CNAME records: <token>._domainkey.<domain> → <token>.dkim.amazonses.com
