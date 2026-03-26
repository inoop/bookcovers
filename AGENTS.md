# AI Agent Guidelines

Read this before making any changes to this repository.

## Architecture Overview

- **Backend:** FastAPI + SQLAlchemy async + Alembic, runs on ECS Fargate
- **Database:** Aurora PostgreSQL (production), PostgreSQL via docker-compose (local)
- **Auth:** AWS Cognito PKCE (production), X-Dev-* headers (local)
- **Storage:** S3 + CloudFront (production), local filesystem (local)
- **CI/CD:** Push to `main` → GitHub Actions builds image → pushes to ECR → ECS rolling deploy

## STOP: Do Not Touch These Things

### Dockerfile references — production outages have resulted from changing these

**`.github/workflows/deploy.yml`** must use `backend/Dockerfile`:
```yaml
docker build -f backend/Dockerfile ... ./backend
```

**`infrastructure/docker/docker-compose.yml`** must use `backend/Dockerfile` as its context:
```yaml
build:
  context: ../../backend
  dockerfile: Dockerfile   # resolves to backend/Dockerfile — correct
```

**`infrastructure/docker/Dockerfile`** is a stale legacy file. It has no entrypoint, no migrations, no Secrets Manager integration. It must NEVER be used in CI or production.

If you see local dev failing, the fix is almost certainly NOT to change a Dockerfile reference. See the Troubleshooting section below.

### Alembic migration files — never edit existing ones

The migration chain is linear: `initial → a1b2c3d4e5f6 → c3d4e5f6a7b8 → c3f8a2b1d9e5`

To make a schema change:
```bash
cd backend
alembic revision --autogenerate -m "describe change"
# Review generated file carefully
alembic upgrade head
```

## How the Pieces Fit Together

### entrypoint.sh (backend/entrypoint.sh)
Runs on every container start. Assembles `DATABASE_URL` from individual secrets env vars (`DB_HOST`, `DB_PORT`, etc.), runs `alembic upgrade head`, runs `python -m app.seed`, then starts uvicorn.

### Two Dockerfiles — only one is correct
- `backend/Dockerfile` — correct, copies alembic/, entrypoint.sh, runs migrations
- `infrastructure/docker/Dockerfile` — stale, launches uvicorn directly, NO migrations

### Auth flow
**Production:** Cognito JWT → `CognitoAuthService` → `_ensure_db_user()` maps Cognito sub to internal UUID

**Local dev:** `AUTH_PROVIDER=none` → `LocalAuthService` reads `X-Dev-Role`/`X-Dev-User-Id` headers → `_ensure_db_user()` maps dev ID to seeded user UUID

The seeded admin user has `external_id="dev-admin-001"`, `role="admin"`. This is what the frontend sends by default on localhost.

### Why local dev might appear "broken"
If someone previously ran a broken version of the stack (before seed.py was fixed), the local DB may have a `dev-admin-001` user with the wrong role (`hiring_user` instead of `admin`). Fix: `docker compose down -v && docker compose up`.

Do NOT try to fix this by modifying Dockerfile paths, deploy.yml, or auth code.

## Common Mistakes to Avoid

1. **Changing the Dockerfile in deploy.yml to `infrastructure/docker/Dockerfile`** — this makes production use SQLite and lose all data
2. **Editing an existing migration file** — other environments have already applied it; editing causes irreversible divergence
3. **Adding `user_id` to `portfolio_assets`** — the model uses `freelancer_profile_id`, not `user_id`
4. **Assuming local SQLite state matches Aurora schema** — always test migrations against PostgreSQL

## Local Development

```bash
cd infrastructure/docker
docker compose up
```

Frontend: http://localhost:5173 | Backend: http://localhost:8000

See README.md for full setup instructions.

## Agent Workflow

1. **Planner agent** — Investigate the task and create an implementation plan
2. **Developer agent** — Implement the changes according to the plan
3. **Closer agent** — Check the work and tie up any loose ends
