from __future__ import annotations

import enum
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import PortableJSON
from app.models.base import Base, TimestampMixin, new_uuid


class BriefDistributionMode(str, enum.Enum):
    PUBLIC = "public"
    PRIVATE_OUTREACH = "private_outreach"


class BriefStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_PAYMENT = "pending_payment"
    PAID = "paid"
    QUEUED_FOR_REVIEW = "queued_for_review"
    CHANGES_REQUESTED = "changes_requested"
    PUBLISHED = "published"
    PRIVATE_OUTREACH = "private_outreach"
    CLOSED = "closed"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class CreativeBrief(TimestampMixin, Base):
    __tablename__ = "creative_briefs"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    submitter_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    submitter_email: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    company_or_author_name: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    project_title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    project_type: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    audience_tags: Mapped[list] = mapped_column(PortableJSON, nullable=False)
    genre_tags: Mapped[list] = mapped_column(PortableJSON, nullable=False)
    summary: Mapped[str] = mapped_column(sa.Text, nullable=False)
    creative_direction: Mapped[str] = mapped_column(sa.Text, nullable=False)
    comp_titles: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    likes: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    dislikes: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    budget_text: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    timeline_text: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    distribution_mode: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=BriefDistributionMode.PUBLIC.value
    )
    status: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=BriefStatus.DRAFT.value
    )
    review_notes: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(sa.DateTime, nullable=True)
    closes_at: Mapped[datetime | None] = mapped_column(sa.DateTime, nullable=True)

    # Relationships
    order = relationship("BriefOrder", back_populates="creative_brief", uselist=False)
    concierge_orders = relationship("ConciergeOrder", back_populates="creative_brief")
