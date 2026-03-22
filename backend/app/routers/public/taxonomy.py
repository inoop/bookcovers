from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.database import get_db
from app.models.taxonomy import TaxonomyTerm
from app.schemas.taxonomy import TaxonomyTermResponse

router = APIRouter(prefix="/api/public/taxonomy", tags=["public-taxonomy"])


@router.get("", response_model=list[TaxonomyTermResponse])
async def list_active_taxonomy_terms(
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint: returns only active taxonomy terms."""
    stmt = sa.select(TaxonomyTerm).where(TaxonomyTerm.is_active == True)  # noqa: E712
    if category:
        stmt = stmt.where(TaxonomyTerm.category == category)
    stmt = stmt.order_by(TaxonomyTerm.category, TaxonomyTerm.sort_order)
    result = await db.execute(stmt)
    return list(result.scalars().all())
