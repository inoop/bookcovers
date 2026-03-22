from __future__ import annotations

import json
from typing import Any

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.freelancer_profile import FreelancerProfile, ProfileStatus
from app.models.book_cover import BookCover, BookCoverContributor, CoverVisibility
from app.models.portfolio_asset import PortfolioAsset, ReviewStatus, AssetVisibility


async def search_freelancers(
    db: AsyncSession,
    *,
    q: str | None = None,
    audience: list[str] | None = None,
    style: list[str] | None = None,
    genre: list[str] | None = None,
    image_tags: list[str] | None = None,
    location: str | None = None,
    uses_ai: bool | None = None,
    sort: str = "newest",
    page: int = 1,
    page_size: int = 24,
    public_only: bool = True,
) -> tuple[list[FreelancerProfile], int]:
    """Search freelancer profiles with filtering, keyword search, and sort."""
    stmt = sa.select(FreelancerProfile)

    if public_only:
        stmt = stmt.where(
            FreelancerProfile.status == ProfileStatus.APPROVED.value,
            FreelancerProfile.approved_for_hire == True,  # noqa: E712
        )

    # Keyword search across searchable fields
    if q:
        like_q = f"%{q}%"
        stmt = stmt.where(
            sa.or_(
                FreelancerProfile.name.ilike(like_q),
                FreelancerProfile.profile_statement.ilike(like_q),
                FreelancerProfile.summary.ilike(like_q),
            )
        )

    # JSON array filtering — use json_each for SQLite, array ops for PG
    settings = get_settings()
    is_sqlite = settings.DATABASE_URL.startswith("sqlite")

    if audience:
        stmt = _filter_json_array(stmt, FreelancerProfile.audience_tags, audience, is_sqlite)
    if style:
        stmt = _filter_json_array(stmt, FreelancerProfile.style_tags, style, is_sqlite)
    if genre:
        stmt = _filter_json_array(stmt, FreelancerProfile.genre_tags, genre, is_sqlite)
    if image_tags:
        stmt = _filter_json_array(stmt, FreelancerProfile.image_tags, image_tags, is_sqlite)

    if location:
        like_loc = f"%{location}%"
        if is_sqlite:
            stmt = stmt.where(
                sa.cast(FreelancerProfile.current_locations, sa.String).ilike(like_loc)
            )
        else:
            stmt = stmt.where(
                sa.cast(FreelancerProfile.current_locations, sa.String).ilike(like_loc)
            )

    if uses_ai is not None:
        stmt = stmt.where(FreelancerProfile.uses_ai == uses_ai)

    # Count
    count_stmt = sa.select(sa.func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    # Sort
    if sort == "newest":
        stmt = stmt.order_by(FreelancerProfile.created_at.desc())
    elif sort == "alpha":
        stmt = stmt.order_by(FreelancerProfile.name.asc())
    elif sort == "featured":
        stmt = stmt.order_by(FreelancerProfile.featured.desc(), FreelancerProfile.created_at.desc())
    else:  # relevance — for now, same as newest
        stmt = stmt.order_by(FreelancerProfile.created_at.desc())

    # Paginate
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    profiles = list(result.scalars().all())
    return profiles, total


async def search_covers(
    db: AsyncSession,
    *,
    q: str | None = None,
    genre: list[str] | None = None,
    audience: list[str] | None = None,
    style: list[str] | None = None,
    contributor: str | None = None,
    imprint: str | None = None,
    sort: str = "newest",
    page: int = 1,
    page_size: int = 24,
) -> tuple[list[BookCover], int]:
    """Search book covers with filtering and sort."""
    stmt = sa.select(BookCover).where(
        BookCover.visibility == CoverVisibility.PUBLIC.value
    )

    if q:
        like_q = f"%{q}%"
        stmt = stmt.where(
            sa.or_(
                BookCover.title.ilike(like_q),
                BookCover.author_name.ilike(like_q),
            )
        )

    settings = get_settings()
    is_sqlite = settings.DATABASE_URL.startswith("sqlite")

    if genre:
        stmt = _filter_json_array(stmt, BookCover.genre_tags, genre, is_sqlite)
    if audience:
        stmt = _filter_json_array(stmt, BookCover.audience_tags, audience, is_sqlite)
    if style:
        stmt = _filter_json_array(stmt, BookCover.visual_tags, style, is_sqlite)

    if imprint:
        stmt = stmt.where(BookCover.imprint.ilike(f"%{imprint}%"))

    if contributor:
        # Join to contributors table
        stmt = stmt.join(BookCoverContributor).where(
            BookCoverContributor.contributor_name.ilike(f"%{contributor}%")
        )

    count_stmt = sa.select(sa.func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    if sort == "newest":
        stmt = stmt.order_by(BookCover.created_at.desc())
    elif sort == "alpha":
        stmt = stmt.order_by(BookCover.title.asc())
    elif sort == "featured":
        stmt = stmt.order_by(BookCover.created_at.desc())
    else:
        stmt = stmt.order_by(BookCover.created_at.desc())

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    covers = list(result.scalars().unique().all())
    return covers, total


async def get_public_portfolio_assets(
    db: AsyncSession, profile_id: str
) -> list[PortfolioAsset]:
    """Get approved, public portfolio assets for a profile."""
    stmt = (
        sa.select(PortfolioAsset)
        .where(
            PortfolioAsset.freelancer_profile_id == profile_id,
            PortfolioAsset.visibility == AssetVisibility.PUBLIC.value,
            PortfolioAsset.review_status == ReviewStatus.APPROVED.value,
        )
        .order_by(PortfolioAsset.sort_order.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_related_covers(
    db: AsyncSession, cover: BookCover, limit: int = 6
) -> list[BookCover]:
    """Find related covers based on shared genre/audience tags."""
    stmt = (
        sa.select(BookCover)
        .where(
            BookCover.visibility == CoverVisibility.PUBLIC.value,
            BookCover.id != cover.id,
        )
        .order_by(BookCover.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


def _filter_json_array(
    stmt: Any, column: Any, values: list[str], is_sqlite: bool
) -> Any:
    """Filter rows where a JSON array column contains any of the given values."""
    if is_sqlite:
        # SQLite: cast to string and check with LIKE for each value
        conditions = []
        for v in values:
            conditions.append(sa.cast(column, sa.String).ilike(f'%"{v}"%'))
        stmt = stmt.where(sa.or_(*conditions))
    else:
        # PostgreSQL: use ?| operator for JSONB array overlap
        from sqlalchemy.dialects.postgresql import JSONB

        stmt = stmt.where(column.cast(JSONB).has_any(sa.cast(values, sa.ARRAY(sa.Text))))
    return stmt
