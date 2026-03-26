from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, new_uuid


class ConciergePackage(TimestampMixin, Base):
    __tablename__ = "concierge_packages"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    price_cents: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, default="USD")
    is_active: Mapped[bool] = mapped_column(sa.Boolean, default=True, nullable=False)
