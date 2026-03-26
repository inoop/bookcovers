from __future__ import annotations

import enum

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, new_uuid


class StorageBackend(str, enum.Enum):
    LOCAL = "local"
    S3 = "s3"


class MediaAsset(TimestampMixin, Base):
    __tablename__ = "media_assets"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    uploaded_by_user_id: Mapped[str | None] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id"), nullable=True
    )
    filename: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    content_type: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    storage_backend: Mapped[str] = mapped_column(
        sa.String(20), nullable=False, default=StorageBackend.LOCAL.value
    )
    storage_key: Mapped[str] = mapped_column(sa.String(1000), nullable=False)
