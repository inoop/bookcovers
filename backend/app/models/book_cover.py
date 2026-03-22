from __future__ import annotations

import enum
from datetime import date

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import PortableJSON
from app.models.base import Base, TimestampMixin, new_uuid


class CoverVisibility(str, enum.Enum):
    PUBLIC = "public"
    HIDDEN = "hidden"
    ARCHIVED = "archived"


class ContributorType(str, enum.Enum):
    DESIGNER = "designer"
    ILLUSTRATOR = "illustrator"
    PHOTOGRAPHER = "photographer"
    LETTERING_ARTIST = "lettering_artist"
    ANIMATOR = "animator"
    OTHER = "other"


class BookCover(TimestampMixin, Base):
    __tablename__ = "book_covers"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(sa.String(500), nullable=True)
    author_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    publisher: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    imprint: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    publication_date: Mapped[date | None] = mapped_column(sa.Date, nullable=True)
    audience_tags: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    genre_tags: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    visual_tags: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    primary_image_asset_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("media_assets.id"), nullable=False
    )
    external_book_url: Mapped[str | None] = mapped_column(sa.String(1000), nullable=True)
    visibility: Mapped[str] = mapped_column(
        sa.String(20), nullable=False, default=CoverVisibility.PUBLIC.value
    )
    slug: Mapped[str | None] = mapped_column(sa.String(255), unique=True, nullable=True)

    # Relationships
    primary_image = relationship("MediaAsset")
    contributors = relationship("BookCoverContributor", back_populates="book_cover")


class BookCoverContributor(TimestampMixin, Base):
    __tablename__ = "book_cover_contributors"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    book_cover_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("book_covers.id"), nullable=False
    )
    freelancer_profile_id: Mapped[str | None] = mapped_column(
        sa.String(36), sa.ForeignKey("freelancer_profiles.id"), nullable=True
    )
    contributor_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    contributor_type: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=ContributorType.DESIGNER.value
    )

    # Relationships
    book_cover = relationship("BookCover", back_populates="contributors")
    freelancer_profile = relationship("FreelancerProfile", back_populates="cover_credits")
