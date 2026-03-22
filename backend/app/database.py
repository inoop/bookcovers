from __future__ import annotations

import json
from collections.abc import AsyncGenerator
from typing import Any

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings


class PortableJSON(sa.types.TypeDecorator):
    """JSON type that uses JSONB on PostgreSQL and sa.JSON on SQLite."""

    impl = sa.types.JSON
    cache_ok = True

    def load_dialect_impl(self, dialect: sa.engine.Dialect) -> sa.types.TypeEngine:
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import JSONB

            return dialect.type_descriptor(JSONB())
        return dialect.type_descriptor(sa.types.JSON())


class Base(DeclarativeBase):
    type_annotation_map = {
        list: PortableJSON,
        dict: PortableJSON,
    }


def _create_engine():
    settings = get_settings()
    connect_args = {}
    if settings.DATABASE_URL.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    return create_async_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        echo=False,
    )


engine = _create_engine()
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
