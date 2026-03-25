from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import Base, engine
from app.services.auth import AuthUser, get_current_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    # In local dev, auto-create tables for convenience
    if settings.ENVIRONMENT == "local":
        import app.models  # noqa: F401 — ensure all models are loaded

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        from app.seed import seed
        await seed()

        from app.routers.admin.settings import seed_default_settings
        from app.database import async_session_factory
        async with async_session_factory() as db:
            await seed_default_settings(db)
            await db.commit()
    yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Book Cover Marketplace API",
        version="0.1.0",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Static files for local uploads
    if settings.STORAGE_BACKEND == "local":
        import os

        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # Routers
    from app.routers.public.freelancers import router as public_freelancers
    from app.routers.public.covers import router as public_covers
    from app.routers.public.taxonomy import router as public_taxonomy
    from app.routers.admin.taxonomy import router as admin_taxonomy
    from app.routers.admin.covers import router as admin_covers
    from app.routers.admin.users import router as admin_users
    from app.routers.admin.orders import router as admin_orders
    from app.routers.admin.content import router as admin_content
    from app.routers.admin.concierge import router as admin_concierge
    from app.routers.admin.settings import router as admin_settings
    from app.routers.freelancer.profile import router as freelancer_profile
    from app.routers.freelancer.portfolio import router as freelancer_portfolio
    from app.routers.internal.review import router as internal_review
    from app.routers.internal.talent import router as internal_talent
    from app.routers.internal.work_samples import router as internal_work_samples

    app.include_router(public_freelancers)
    app.include_router(public_covers)
    app.include_router(public_taxonomy)
    app.include_router(admin_taxonomy)
    app.include_router(admin_covers)
    app.include_router(admin_users)
    app.include_router(admin_orders)
    app.include_router(admin_content)
    app.include_router(admin_concierge)
    app.include_router(admin_settings)
    app.include_router(freelancer_profile)
    app.include_router(freelancer_portfolio)
    app.include_router(internal_review)
    app.include_router(internal_talent)
    app.include_router(internal_work_samples)

    # Health check
    @app.get("/api/health")
    async def health():
        return {"status": "ok", "environment": settings.ENVIRONMENT}

    # Current user info (authoritative role from DB)
    @app.get("/api/me")
    async def get_me(user: AuthUser = Depends(get_current_user)):
        return {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
        }

    return app


app = create_app()
