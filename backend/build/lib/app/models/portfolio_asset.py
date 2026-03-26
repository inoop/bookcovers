from __future__ import annotations

import enum

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import PortableJSON
from app.models.base import Base, TimestampMixin, new_uuid


class AssetType(str, enum.Enum):
    IMAGE = "image"
    PDF = "pdf"
    VIDEO = "video"
    LINK = "link"


class AssetVisibility(str, enum.Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    HIDDEN = "hidden"


class ReviewStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    HIDDEN = "hidden"


class PortfolioAsset(TimestampMixin, Base):
    __tablename__ = "portfolio_assets"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    freelancer_profile_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("freelancer_profiles.id"), nullable=False
    )
    media_asset_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("media_assets.id"), nullable=False
    )
    title: Mapped[str | None] = mapped_column(sa.String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    asset_type: Mapped[str] = mapped_column(
        sa.String(20), nullable=False, default=AssetType.IMAGE.value
    )
    visibility: Mapped[str] = mapped_column(
        sa.String(20), nullable=False, default=AssetVisibility.PUBLIC.value
    )
    review_status: Mapped[str] = mapped_column(
        sa.String(20), nullable=False, default=ReviewStatus.PENDING.value
    )
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    tags: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)

    # Relationships
    freelancer_profile = relationship("FreelancerProfile", back_populates="portfolio_assets")
    media_asset = relationship("MediaAsset")
