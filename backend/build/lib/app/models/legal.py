from __future__ import annotations

import enum

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class LegalWorkflowStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PENDING = "pending"
    COMPLETE = "complete"


class LegalContactLink(TimestampMixin, Base):
    __tablename__ = "legal_contact_links"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    freelancer_profile_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("freelancer_profiles.id"), nullable=False
    )
    external_url: Mapped[str | None] = mapped_column(sa.String(1000), nullable=True)
    external_system_id: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    workflow_status: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=LegalWorkflowStatus.NOT_STARTED.value
    )
    notes: Mapped[str | None] = mapped_column(sa.Text, nullable=True)

    freelancer_profile = relationship("FreelancerProfile", back_populates="legal_links")
