# Book Covers Job Board

A marketplace connecting book cover designers/illustrators with publishers and authors.

**Tech stack:** FastAPI · SQLAlchemy (async) · Alembic · React (Vite) · AWS ECS Fargate · Aurora PostgreSQL · Cognito · S3/CloudFront

---

## Local Development

### Prerequisites
- Docker + Docker Compose

### Start everything

```bash
cd infrastructure/docker
docker compose up
```

Services:
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

### Local auth

Local dev uses header-based auth (no Cognito). The frontend automatically sends `X-Dev-Role` and `X-Dev-User-Id` headers. The default dev user is:

- **Email:** admin@localhost
- **Role:** admin
- **User ID:** dev-admin-001

This user is created by the seed script when the backend starts. No login required.

### Resetting the database

If auth behaves unexpectedly (wrong role, missing user), reset with:

```bash
docker compose down -v   # drops the postgres volume
docker compose up
```

The backend runs migrations and re-seeds on every startup, so a fresh volume will have the correct state.

---

## Architecture

```
Browser → CloudFront → S3 (frontend static files)
                     → ALB → ECS Fargate (backend API)
                                         → Aurora PostgreSQL
                                         → S3 (media uploads)
                                         → Cognito (auth, prod only)
```

- **Auth (production):** AWS Cognito PKCE OAuth2 → JWT validated by backend
- **Auth (local):** `X-Dev-*` request headers → `LocalAuthService` in backend
- **Storage:** Local filesystem in dev; S3 + CloudFront in production
- **Migrations:** Alembic, run automatically at container startup via `entrypoint.sh`
- **Seeding:** `backend/app/seed.py` — idempotent, runs at every startup

---

## CI/CD Pipeline

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`):

1. Builds Docker image from **`backend/Dockerfile`**
2. Pushes to ECR
3. Triggers ECS rolling deploy
4. Waits for service stability

OIDC is used for AWS auth — no long-lived credentials in secrets.

---

## CRITICAL: What NOT to Change

These are the things that have caused production outages. Read carefully before touching them.

### 1. Dockerfile reference in deploy.yml

```yaml
# .github/workflows/deploy.yml — DO NOT CHANGE THIS
docker build \
  -f backend/Dockerfile \    ← must be backend/Dockerfile
  ...
  ./backend
```

`backend/Dockerfile` runs `entrypoint.sh` which:
- Assembles `DATABASE_URL` from Secrets Manager env vars
- Runs `alembic upgrade head`
- Runs `python -m app.seed`
- Starts uvicorn

**`infrastructure/docker/Dockerfile` is a stale file that does none of this.** If CI ever uses it, production falls back to SQLite and all data operations fail.

### 2. Dockerfile reference in docker-compose.yml

```yaml
# infrastructure/docker/docker-compose.yml — DO NOT CHANGE THIS
backend:
  build:
    context: ../../backend
    dockerfile: Dockerfile   ← resolves to backend/Dockerfile
```

Same reason: `backend/Dockerfile` has the entrypoint that runs migrations and seed.

### 3. Existing Alembic migration files

**Never edit a migration file that has already been applied to any database.** The migration chain is:

```
initial → a1b2c3d4e5f6 → c3d4e5f6a7b8 → c3f8a2b1d9e5 (head)
```

To add a schema change, always create a new migration:

```bash
cd backend
alembic revision --autogenerate -m "describe your change"
# Review the generated file, then:
alembic upgrade head
```

---

## Auth System

### Production (AUTH_PROVIDER=cognito)

1. Frontend redirects to Cognito hosted UI
2. Cognito issues JWT
3. Backend validates JWT via JWKS endpoint
4. `_ensure_db_user()` maps Cognito `sub` → internal `users.id` (creates row if first login)
5. DB role is authoritative — only admins can change it

### Local dev (AUTH_PROVIDER=none)

1. Frontend sends `X-Dev-Role` / `X-Dev-User-Id` headers (from localStorage or defaults)
2. `LocalAuthService` reads headers, falls back to config defaults
3. `_ensure_db_user()` maps the dev user ID → internal `users.id` (finds seeded user)
4. DB role is still authoritative — seeded admin user has role=admin

To switch roles in local dev, open the browser console and:

```js
localStorage.setItem('dev_role', 'hiring_user');
localStorage.setItem('dev_user_id', 'dev-hiring-001');
// refresh the page
```

---

## Troubleshooting

**Backend won't start / migration errors**
```bash
docker compose logs backend
# If schema is out of sync:
docker compose down -v && docker compose up
```

**Auth errors / wrong role in local dev**
```bash
docker compose down -v && docker compose up
```
This resets the DB so the seed creates a clean admin user.

**Production shows wrong data / SQLite errors in logs**
Check that `deploy.yml` is using `backend/Dockerfile` (not `infrastructure/docker/Dockerfile`). If it was changed, revert it and push.

**ECS service not updating after push**
Check GitHub Actions tab for deploy status. The deploy waits for service stability — if a container is crashing, the deploy will time out with an error.
