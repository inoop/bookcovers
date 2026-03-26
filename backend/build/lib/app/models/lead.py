from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, new_uuid


class Inquiry(TimestampMixin, Base):
    __tablename__ = "inquiries"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    email: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    subject: Mapped[str | None] = mapped_column(sa.String(500), nullable=True)
    message: Mapped[str] = mapped_column(sa.Text, nullable=False)
    source_page: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)


class EmailSubscription(TimestampMixin, Base):
    __tablename__ = "email_subscriptions"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    email: Mapped[str] = mapped_column(sa.String(255), unique=True, nullable=False)
    is_confirmed: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    subscription_type: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default="newsletter"
    )
