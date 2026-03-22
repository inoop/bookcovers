from __future__ import annotations

import enum

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class NoteType(str, enum.Enum):
    GENERAL = "general"
    FIT = "fit"
    COMPLIANCE = "compliance"
    PROJECT = "project"
    EVALUATION = "evaluation"


class NoteVisibility(str, enum.Enum):
    INTERNAL = "internal"


class ProfileNote(TimestampMixin, Base):
    __tablename__ = "profile_notes"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    freelancer_profile_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("freelancer_profiles.id"), nullable=False
    )
    author_user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id"), nullable=False
    )
    note_type: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=NoteType.GENERAL.value
    )
    body: Mapped[str] = mapped_column(sa.Text, nullable=False)
    visibility: Mapped[str] = mapped_column(
        sa.String(20), nullable=False, default=NoteVisibility.INTERNAL.value
    )

    freelancer_profile = relationship("FreelancerProfile", back_populates="notes")
    author = relationship("User", back_populates="notes")


class FeedbackEntry(TimestampMixin, Base):
    __tablename__ = "feedback_entries"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    freelancer_profile_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("freelancer_profiles.id"), nullable=False
    )
    author_user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id"), nullable=False
    )
    body: Mapped[str] = mapped_column(sa.Text, nullable=False)
    project_context: Mapped[str | None] = mapped_column(sa.String(500), nullable=True)

    freelancer_profile = relationship("FreelancerProfile", back_populates="feedback_entries")
    author = relationship("User", back_populates="feedback_entries")
