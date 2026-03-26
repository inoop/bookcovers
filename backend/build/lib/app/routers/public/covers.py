from __future__ import annotations

import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.database import get_db
from app.models.book_cover import BookCover, BookCoverContributor, CoverVisibility
from app.models.media import MediaAsset
from app.schemas.book_cover import (
    BookCoverCardResponse,
    BookCoverDetailResponse,
    ContributorResponse,
)
from app.schemas.freelancer import PaginatedResponse
from app.services.search import search_covers, get_related_covers
from app.services.storage import get_storage_service, StorageService

router = APIRouter(prefix="/api/public/covers", tags=["public-covers"])


@router.get("", response_model=PaginatedResponse)
async def list_covers(
    q: str | None = Query(None),
    genre: list[str] | None = Query(None),
    audience: list[str] | None = Query(None),
    style: list[str] | None = Query(None),
    contributor: str | None = Query(None),
    imprint: str | None = Query(None),
    sort: str = Query("newest", pattern="^(newest|alpha|featured|relevance)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    covers, total = await search_covers(
        db,
        q=q,
        genre=genre,
        audience=audience,
        style=style,
        contributor=contributor,
        imprint=imprint,
        sort=sort,
        page=page,
        page_size=page_size,
    )

    cards = []
    for c in covers:
        image_url = await _get_cover_image_url(db, c.primary_image_asset_id, storage)
        contributors = await _get_contributors(db, c.id)
        cards.append(
            BookCoverCardResponse(
                id=c.id,
                slug=c.slug,
                title=c.title,
                subtitle=c.subtitle,
                author_name=c.author_name,
                publisher=c.publisher,
                imprint=c.imprint,
                audience_tags=c.audience_tags,
                genre_tags=c.genre_tags,
                visual_tags=c.visual_tags,
                primary_image_url=image_url,
                contributors=contributors,
            )
        )

    return PaginatedResponse(
        items=cards,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/{cover_id}", response_model=BookCoverDetailResponse)
async def get_cover_detail(
    cover_id: str,
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    stmt = sa.select(BookCover).where(
        sa.or_(BookCover.id == cover_id, BookCover.slug == cover_id),
        BookCover.visibility == CoverVisibility.PUBLIC.value,
    )
    result = await db.execute(stmt)
    cover = result.scalar_one_or_none()
    if not cover:
        raise HTTPException(404, "Book cover not found")

    image_url = await _get_cover_image_url(db, cover.primary_image_asset_id, storage)
    contributors = await _get_contributors(db, cover.id)
    related = await get_related_covers(db, cover, limit=6)
    related_cards = []
    for r in related:
        r_image = await _get_cover_image_url(db, r.primary_image_asset_id, storage)
        r_contribs = await _get_contributors(db, r.id)
        related_cards.append(
            BookCoverCardResponse(
                id=r.id,
                slug=r.slug,
                title=r.title,
                subtitle=r.subtitle,
                author_name=r.author_name,
                publisher=r.publisher,
                imprint=r.imprint,
                audience_tags=r.audience_tags,
                genre_tags=r.genre_tags,
                visual_tags=r.visual_tags,
                primary_image_url=r_image,
                contributors=r_contribs,
            )
        )

    pub_date = cover.publication_date.isoformat() if cover.publication_date else None

    return BookCoverDetailResponse(
        id=cover.id,
        slug=cover.slug,
        title=cover.title,
        subtitle=cover.subtitle,
        author_name=cover.author_name,
        publisher=cover.publisher,
        imprint=cover.imprint,
        publication_date=pub_date,
        audience_tags=cover.audience_tags,
        genre_tags=cover.genre_tags,
        visual_tags=cover.visual_tags,
        primary_image_url=image_url,
        external_book_url=cover.external_book_url,
        contributors=contributors,
        related_covers=related_cards,
    )


async def _get_cover_image_url(
    db: AsyncSession, asset_id: str, storage: StorageService
) -> str | None:
    media = await db.get(MediaAsset, asset_id)
    if not media:
        return None
    return storage.get_url(media.storage_key)


async def _get_contributors(
    db: AsyncSession, cover_id: str
) -> list[ContributorResponse]:
    from app.models.freelancer_profile import FreelancerProfile

    stmt = sa.select(BookCoverContributor).where(
        BookCoverContributor.book_cover_id == cover_id
    )
    result = await db.execute(stmt)
    contribs = list(result.scalars().all())

    responses = []
    for c in contribs:
        freelancer_name = None
        freelancer_slug = None
        if c.freelancer_profile_id:
            fp = await db.get(FreelancerProfile, c.freelancer_profile_id)
            if fp:
                freelancer_name = fp.name
                freelancer_slug = fp.slug
        responses.append(
            ContributorResponse(
                id=c.id,
                contributor_name=c.contributor_name,
                contributor_type=c.contributor_type,
                freelancer_profile_id=c.freelancer_profile_id,
                freelancer_name=freelancer_name,
                freelancer_slug=freelancer_slug,
            )
        )
    return responses
