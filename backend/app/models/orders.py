from __future__ import annotations

import enum

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class RefundStatus(str, enum.Enum):
    NONE = "none"
    REQUESTED = "requested"
    PROCESSING = "processing"
    COMPLETED = "completed"
    DENIED = "denied"


class BriefOrder(TimestampMixin, Base):
    __tablename__ = "brief_orders"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    creative_brief_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("creative_briefs.id"), unique=True, nullable=False
    )
    amount: Mapped[int] = mapped_column(sa.Integer, nullable=False)  # cents
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, default="USD")
    payment_provider: Mapped[str | None] = mapped_column(sa.String(50), nullable=True)
    provider_transaction_id: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    payment_status: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=PaymentStatus.PENDING.value
    )
    refund_status: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=RefundStatus.NONE.value
    )

    creative_brief = relationship("CreativeBrief", back_populates="order")


class ConciergeOrder(TimestampMixin, Base):
    __tablename__ = "concierge_orders"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=new_uuid)
    creative_brief_id: Mapped[str | None] = mapped_column(
        sa.String(36), sa.ForeignKey("creative_briefs.id"), nullable=True
    )
    service_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    amount: Mapped[int] = mapped_column(sa.Integer, nullable=False)  # cents
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, default="USD")
    payment_provider: Mapped[str | None] = mapped_column(sa.String(50), nullable=True)
    provider_transaction_id: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    payment_status: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=PaymentStatus.PENDING.value
    )
    refund_status: Mapped[str] = mapped_column(
        sa.String(50), nullable=False, default=RefundStatus.NONE.value
    )

    creative_brief = relationship("CreativeBrief", back_populates="concierge_orders")
