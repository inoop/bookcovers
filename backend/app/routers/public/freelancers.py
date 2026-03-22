from __future__ import annotations

import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import sqlalchemy as sa

from app.database import get_db
from app.models.freelancer_profile import FreelancerProfile, ProfileStatus
from app.models.portfolio_asset import PortfolioAsset, AssetVisibility, ReviewStatus
from app.schemas.freelancer import (
    FreelancerCardResponse,
    FreelancerPublicDetailResponse,
    PaginatedResponse,
    PortfolioAssetPublicResponse,
)
from app.services.search import search_freelancers, get_public_portfolio_assets
from app.services.storage import get_storage_service, StorageService

router = APIRouter(prefix="/api/public/freelancers", tags=["public-freelancers"])


@router.get("", response_model=PaginatedResponse)
async def list_freelancers(
    q: str | None = Query(None, description="Keyword search"),
    audience: list[str] | None = Query(None),
    style: list[str] | None = Query(None),
    genre: list[str] | None = Query(None),
    image_tags: list[str] | None = Query(None),
    location: str | None = Query(None),
    uses_ai: bool | None = Query(None),
    sort: str = Query("newest", pattern="^(newest|alpha|featured|relevance)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profiles, total = await search_freelancers(
        db,
        q=q,
        audience=audience,
        style=style,
        genre=genre,
        image_tags=image_tags,
        location=location,
        uses_ai=uses_ai,
        sort=sort,
        page=page,
        page_size=page_size,
        public_only=True,
    )

    cards = []
    for p in profiles:
        hero_url = await _get_hero_image(db, p.id, storage)
        cards.append(
            FreelancerCardResponse(
                id=p.id,
                slug=p.slug,
                name=p.name,
                pronouns=p.pronouns,
                summary=p.summary,
                current_locations=p.current_locations,
                audience_tags=p.audience_tags,
                style_tags=p.style_tags,
                genre_tags=p.genre_tags,
                image_tags=p.image_tags,
                profile_statement=p.profile_statement,
                featured=p.featured,
                hero_image_url=hero_url,
            )
        )

    return PaginatedResponse(
        items=cards,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/{profile_id}", response_model=FreelancerPublicDetailResponse)
async def get_freelancer_detail(
    profile_id: str,
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    # Try by ID or slug
    stmt = sa.select(FreelancerProfile).where(
        sa.or_(
            FreelancerProfile.id == profile_id,
            FreelancerProfile.slug == profile_id,
        ),
        FreelancerProfile.status == ProfileStatus.APPROVED.value,
        FreelancerProfile.approved_for_hire == True,  # noqa: E712
    )
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Freelancer not found")

    # Get public portfolio assets
    assets = await get_public_portfolio_assets(db, profile.id)
    asset_responses = []
    for a in assets:
        media_url = None
        if a.media_asset_id:
            media = await db.get(
                __import__("app.models.media", fromlist=["MediaAsset"]).MediaAsset,
                a.media_asset_id,
            )
            if media:
                media_url = storage.get_url(media.storage_key)
        asset_responses.append(
            PortfolioAssetPublicResponse(
                id=a.id,
                title=a.title,
                description=a.description,
                asset_type=a.asset_type,
                sort_order=a.sort_order,
                tags=a.tags,
                media_url=media_url,
            )
        )

    return FreelancerPublicDetailResponse(
        id=profile.id,
        slug=profile.slug,
        name=profile.name,
        pronouns=profile.pronouns,
        summary=profile.summary,
        website_links=profile.website_links,
        current_locations=profile.current_locations,
        audience_tags=profile.audience_tags,
        style_tags=profile.style_tags,
        genre_tags=profile.genre_tags,
        image_tags=profile.image_tags,
        uses_ai=profile.uses_ai,
        profile_statement=profile.profile_statement,
        featured=profile.featured,
        portfolio_assets=asset_responses,
    )


async def _get_hero_image(
    db: AsyncSession, profile_id: str, storage: StorageService
) -> str | None:
    """Get the first approved public portfolio asset URL as the hero image."""
    from app.models.media import MediaAsset

    stmt = (
        sa.select(PortfolioAsset)
        .where(
            PortfolioAsset.freelancer_profile_id == profile_id,
            PortfolioAsset.visibility == AssetVisibility.PUBLIC.value,
            PortfolioAsset.review_status == ReviewStatus.APPROVED.value,
        )
        .order_by(PortfolioAsset.sort_order.asc())
        .limit(1)
    )
    result = await db.execute(stmt)
    asset = result.scalar_one_or_none()
    if not asset:
        return None
    media = await db.get(MediaAsset, asset.media_asset_id)
    if not media:
        return None
    return storage.get_url(media.storage_key)
