from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.content import ResourceArticle
from app.schemas.content import ArticleCreateRequest, ArticleResponse, ArticleUpdateRequest
from app.services.auth import AuthUser

router = APIRouter(prefix="/api/admin/content", tags=["admin-content"])


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text[:200]


@router.get("/articles", response_model=list[ArticleResponse])
async def list_articles(
    is_published: bool | None = Query(None),
    category: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    stmt = sa.select(ResourceArticle).order_by(ResourceArticle.created_at.desc())
    if is_published is not None:
        stmt = stmt.where(ResourceArticle.is_published == is_published)
    if category:
        stmt = stmt.where(ResourceArticle.category == category)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.post("/articles", response_model=ArticleResponse, status_code=201)
async def create_article(
    body: ArticleCreateRequest,
    user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    data = body.model_dump()
    if not data.get("slug") and data.get("title"):
        data["slug"] = _slugify(data["title"])
    data["author_user_id"] = user.user_id
    article = ResourceArticle(**data)
    db.add(article)
    await db.flush()
    await db.refresh(article)
    return article


@router.put("/articles/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    body: ArticleUpdateRequest,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    article = await db.get(ResourceArticle, article_id)
    if not article:
        raise HTTPException(404, "Article not found")
    data = body.model_dump(exclude_unset=True)
    if "title" in data and "slug" not in data:
        data["slug"] = _slugify(data["title"])
    for field, value in data.items():
        setattr(article, field, value)
    await db.flush()
    await db.refresh(article)
    return article


@router.delete("/articles/{article_id}", status_code=204)
async def delete_article(
    article_id: str,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    article = await db.get(ResourceArticle, article_id)
    if not article:
        raise HTTPException(404, "Article not found")
    await db.delete(article)
