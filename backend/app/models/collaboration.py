from __future__ import annotations

import enum

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import PortableJSON
from app.models.base import Base, TimestampMixin, new_uuid


class FolderPrivacy(str, enum.Enum):
    PRIVATE = "private"
    SHARED_USERS = "shared_users"
    SHARED_TEAM = "shared_team"


class Folder(TimestampMixin, Base):
    __tablename__ = "folders"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    owner_user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    privacy: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=FolderPrivacy.PRIVATE.value
    )
    description: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    shared_with: Mapped[list | None] = mapped_column(PortableJSON, nullable=True)

    owner = relationship("User", back_populates="folders")
    memberships = relationship("FolderMembership", back_populates="folder")


class FolderMembership(TimestampMixin, Base):
    __tablename__ = "folder_memberships"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    folder_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("folders.id"), nullable=False
    )
    freelancer_profile_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("freelancer_profiles.id"), nullable=False
    )

    folder = relationship("Folder", back_populates="memberships")
    freelancer_profile = relationship("FreelancerProfile", back_populates="folder_memberships")

    __table_args__ = (
        sa.UniqueConstraint(
            "folder_id", "freelancer_profile_id", name="uq_folder_membership"
        ),
    )


class Favorite(TimestampMixin, Base):
    __tablename__ = "favorites"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id"), nullable=False
    )
    freelancer_profile_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("freelancer_profiles.id"), nullable=False
    )

    user = relationship("User", back_populates="favorites")
    freelancer_profile = relationship("FreelancerProfile", back_populates="favorites")

    __table_args__ = (
        sa.UniqueConstraint("user_id", "freelancer_profile_id", name="uq_user_favorite"),
    )
