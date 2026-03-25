from __future__ import annotations

import math

import sqlalchemy as sa
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.freelancer_profile import FreelancerProfile
from app.models.media import MediaAsset
from app.models.portfolio_asset import AssetVisibility, PortfolioAsset, ReviewStatus
from app.schemas.freelancer import PaginatedResponse
from app.schemas.internal import WorkSampleCard
from app.services.auth import AuthUser
from app.services.storage import StorageService, get_storage_service

router = APIRouter(prefix="/api/internal/work-samples", tags=["internal-work-samples"])

_INTERNAL_ROLES = ("hiring_user", "reviewer", "admin")


@router.get("", response_model=PaginatedResponse)
async def list_work_samples(
    q: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    _user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    # Base query joining PortfolioAsset → FreelancerProfile via freelancer_profile_id
    stmt = (
        sa.select(PortfolioAsset, FreelancerProfile)
        .join(FreelancerProfile, FreelancerProfile.id == PortfolioAsset.freelancer_profile_id)
        .where(PortfolioAsset.review_status == ReviewStatus.APPROVED.value)
        .where(PortfolioAsset.visibility == AssetVisibility.PUBLIC.value)
        .where(PortfolioAsset.asset_type == "image")
    )

    if q:
        term = f"%{q.lower()}%"
        stmt = stmt.where(
            sa.or_(
                sa.func.lower(FreelancerProfile.name).like(term),
                sa.func.lower(PortfolioAsset.title).like(term),
            )
        )

    total_stmt = sa.select(sa.func.count()).select_from(stmt.subquery())
    total: int = (await db.execute(total_stmt)).scalar_one()

    stmt = stmt.order_by(PortfolioAsset.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    rows = list((await db.execute(stmt)).all())

    items: list[WorkSampleCard] = []
    for asset, profile in rows:
        media_url = None
        if asset.media_asset_id:
            media = await db.get(MediaAsset, asset.media_asset_id)
            if media:
                media_url = storage.get_url(media.storage_key)
        items.append(
            WorkSampleCard(
                id=asset.id,
                title=asset.title,
                media_url=media_url,
                freelancer_name=profile.name,
                freelancer_slug=profile.slug,
                freelancer_profile_id=profile.id,
                created_at=asset.created_at,
            )
        )

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )
