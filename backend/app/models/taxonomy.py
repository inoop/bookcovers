from __future__ import annotations

import enum

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.database import PortableJSON
from app.models.base import Base, TimestampMixin, new_uuid


class TaxonomyCategory(str, enum.Enum):
    AUDIENCE = "audience"
    STYLE = "style"
    GENRE = "genre"
    IMAGE_TAG = "image_tag"
    LOCATION = "location"
    PROJECT_TYPE = "project_type"


class TaxonomyTerm(TimestampMixin, Base):
    __tablename__ = "taxonomy_terms"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    category: Mapped[str] = mapped_column(sa.String(50), nullable=False, index=True)
    label: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    internal_label: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    slug: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, default=True, nullable=False)
    aliases: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)

    __table_args__ = (
        sa.UniqueConstraint("category", "slug", name="uq_taxonomy_category_slug"),
    )
