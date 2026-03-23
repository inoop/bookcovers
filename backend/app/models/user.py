import enum

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class UserRole(str, enum.Enum):
    ANONYMOUS = "anonymous"
    HIRING_USER = "hiring_user"
    FREELANCER = "freelancer"
    REVIEWER = "reviewer"
    ADMIN = "admin"


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    external_id: Mapped[str] = mapped_column(sa.String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=UserRole.HIRING_USER.value
    )
    is_active: Mapped[bool] = mapped_column(sa.Boolean, default=True, nullable=False)

    # Relationships
    freelancer_profiles = relationship(
        "FreelancerProfile",
        back_populates="user",
        foreign_keys="[FreelancerProfile.user_id]",
    )
    portfolio_assets = relationship("PortfolioAsset", back_populates="user")
    folders = relationship("Folder", back_populates="owner")
    favorites = relationship("Favorite", back_populates="user")
    notes = relationship("ProfileNote", back_populates="author")
    feedback_entries = relationship("FeedbackEntry", back_populates="author")
