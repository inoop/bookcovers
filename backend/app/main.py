from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import Base, engine


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
    from app.routers.freelancer.profile import router as freelancer_profile
    from app.routers.freelancer.portfolio import router as freelancer_portfolio

    app.include_router(public_freelancers)
    app.include_router(public_covers)
    app.include_router(public_taxonomy)
    app.include_router(admin_taxonomy)
    app.include_router(freelancer_profile)
    app.include_router(freelancer_portfolio)

    # Health check
    @app.get("/api/health")
    async def health():
        return {"status": "ok", "environment": settings.ENVIRONMENT}

    return app


app = create_app()
