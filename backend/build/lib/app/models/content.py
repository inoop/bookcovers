from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import PortableJSON
from app.models.base import Base, TimestampMixin, new_uuid


class ResourceArticle(TimestampMixin, Base):
    __tablename__ = "resource_articles"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str | None] = mapped_column(sa.String(255), unique=True, nullable=True)
    summary: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    body: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    category: Mapped[str | None] = mapped_column(sa.String(100), nullable=True)
    tags: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    is_published: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    author_user_id: Mapped[str | None] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id"), nullable=True
    )

    author = relationship("User", foreign_keys=[author_user_id])
