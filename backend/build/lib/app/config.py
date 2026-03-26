from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./local.db"

    # Auth
    AUTH_PROVIDER: Literal["none", "cognito"] = "none"
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_APP_CLIENT_ID: str = ""
    COGNITO_REGION: str = "us-east-1"

    # Storage
    STORAGE_BACKEND: Literal["local", "s3"] = "local"
    S3_BUCKET: str = ""
    S3_REGION: str = "us-east-1"
    CLOUDFRONT_DOMAIN: str = ""

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # AWS
    AWS_REGION: str = "us-east-1"

    # Local dev defaults
    DEV_USER_ID: str = "dev-admin-001"
    DEV_USER_EMAIL: str = "admin@localhost"
    DEV_USER_ROLE: str = "admin"


@lru_cache
def get_settings() -> Settings:
    return Settings()
