from __future__ import annotations

import enum
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import PortableJSON
from app.models.base import Base, TimestampMixin, new_uuid


class ProfileStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    CHANGES_REQUESTED = "changes_requested"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class FreelancerProfile(TimestampMixin, Base):
    __tablename__ = "freelancer_profiles"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id"), nullable=False
    )
    slug: Mapped[str | None] = mapped_column(sa.String(255), unique=True, nullable=True)

    # About Me
    is_self_submission: Mapped[bool] = mapped_column(sa.Boolean, default=True, nullable=False)
    relation_type: Mapped[str | None] = mapped_column(sa.String(100), nullable=True)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    pronouns: Mapped[str | None] = mapped_column(sa.String(100), nullable=True)
    summary: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    email: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    website_links: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    resume_asset_id: Mapped[str | None] = mapped_column(
        sa.String(36), sa.ForeignKey("media_assets.id"), nullable=True
    )

    # Locations
    current_locations: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    past_locations: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)

    # Representation
    has_agent: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    agent_details: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    worked_with_prh: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    prh_details: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    employee_of_prh: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    prh_employee_details: Mapped[str | None] = mapped_column(sa.Text, nullable=True)

    # Artistic Classifications
    audience_tags: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    style_tags: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    genre_tags: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    image_tags: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    uses_ai: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    ai_details: Mapped[str | None] = mapped_column(sa.Text, nullable=True)

    # Self-Identification
    lived_experience_statement: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    books_excited_about: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)
    profile_statement: Mapped[str | None] = mapped_column(sa.Text, nullable=True)

    # Admin / Status
    approved_for_hire: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=ProfileStatus.DRAFT.value
    )
    featured: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    rate_info: Mapped[dict | None] = mapped_column(PortableJSON, nullable=True)
    last_reviewed_at: Mapped[datetime | None] = mapped_column(sa.DateTime, nullable=True)
    review_owner_id: Mapped[str | None] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id"), nullable=True
    )

    # Relationships
    user = relationship("User", back_populates="freelancer_profiles", foreign_keys=[user_id])
    portfolio_assets = relationship("PortfolioAsset", back_populates="freelancer_profile")
    cover_credits = relationship("BookCoverContributor", back_populates="freelancer_profile")
    notes = relationship("ProfileNote", back_populates="freelancer_profile")
    feedback_entries = relationship("FeedbackEntry", back_populates="freelancer_profile")
    legal_links = relationship("LegalContactLink", back_populates="freelancer_profile")
    folder_memberships = relationship("FolderMembership", back_populates="freelancer_profile")
    favorites = relationship("Favorite", back_populates="freelancer_profile")
    resume_asset = relationship("MediaAsset", foreign_keys=[resume_asset_id])
