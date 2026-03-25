#!/bin/bash
set -e

# Construct DATABASE_URL from individual secrets if not already set
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL="postgresql+asyncpg://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
fi

# Run migrations
alembic upgrade head

# Seed taxonomy data (idempotent — skips if already seeded)
python -m app.seed

# Start server
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
