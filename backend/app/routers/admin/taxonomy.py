from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.taxonomy import TaxonomyTerm
from app.schemas.taxonomy import TaxonomyTermCreate, TaxonomyTermResponse, TaxonomyTermUpdate
from app.services.auth import AuthUser

router = APIRouter(prefix="/api/admin/taxonomy", tags=["admin-taxonomy"])


@router.get("", response_model=list[TaxonomyTermResponse])
async def list_taxonomy_terms(
    category: str | None = Query(None),
    include_inactive: bool = Query(False),
    _user: AuthUser = Depends(require_roles("admin", "reviewer")),
    db: AsyncSession = Depends(get_db),
):
    stmt = sa.select(TaxonomyTerm)
    if category:
        stmt = stmt.where(TaxonomyTerm.category == category)
    if not include_inactive:
        stmt = stmt.where(TaxonomyTerm.is_active == True)  # noqa: E712
    stmt = stmt.order_by(TaxonomyTerm.category, TaxonomyTerm.sort_order)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.post("", response_model=TaxonomyTermResponse, status_code=201)
async def create_taxonomy_term(
    body: TaxonomyTermCreate,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    term = TaxonomyTerm(**body.model_dump())
    db.add(term)
    await db.flush()
    await db.refresh(term)
    return term


@router.put("/{term_id}", response_model=TaxonomyTermResponse)
async def update_taxonomy_term(
    term_id: str,
    body: TaxonomyTermUpdate,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    term = await db.get(TaxonomyTerm, term_id)
    if not term:
        raise HTTPException(404, "Taxonomy term not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(term, field, value)
    await db.flush()
    await db.refresh(term)
    return term


@router.delete("/{term_id}", status_code=204)
async def delete_taxonomy_term(
    term_id: str,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    term = await db.get(TaxonomyTerm, term_id)
    if not term:
        raise HTTPException(404, "Taxonomy term not found")
    await db.delete(term)
