from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.orders import BriefOrder, ConciergeOrder
from app.models.lead import Inquiry, EmailSubscription
from app.schemas.orders import (
    BriefOrderResponse,
    ConciergeOrderResponse,
    InquiryResponse,
    EmailSubscriptionResponse,
)
from app.services.auth import AuthUser

router = APIRouter(prefix="/api/admin", tags=["admin-orders"])


@router.get("/orders/brief", response_model=list[BriefOrderResponse])
async def list_brief_orders(
    payment_status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    stmt = sa.select(BriefOrder).order_by(BriefOrder.created_at.desc())
    if payment_status:
        stmt = stmt.where(BriefOrder.payment_status == payment_status)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/orders/concierge", response_model=list[ConciergeOrderResponse])
async def list_concierge_orders(
    payment_status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    stmt = sa.select(ConciergeOrder).order_by(ConciergeOrder.created_at.desc())
    if payment_status:
        stmt = stmt.where(ConciergeOrder.payment_status == payment_status)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/leads/inquiries", response_model=list[InquiryResponse])
async def list_inquiries(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        sa.select(Inquiry)
        .order_by(Inquiry.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/leads/subscriptions", response_model=list[EmailSubscriptionResponse])
async def list_subscriptions(
    is_confirmed: bool | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    stmt = sa.select(EmailSubscription).order_by(EmailSubscription.created_at.desc())
    if is_confirmed is not None:
        stmt = stmt.where(EmailSubscription.is_confirmed == is_confirmed)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    return list(result.scalars().all())
