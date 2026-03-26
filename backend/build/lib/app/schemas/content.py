from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class ArticleCreateRequest(BaseModel):
    title: str
    slug: str | None = None
    summary: str | None = None
    body: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_published: bool = False


class ArticleUpdateRequest(BaseModel):
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    body: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_published: bool | None = None


class ArticleResponse(BaseModel):
    id: str
    title: str
    slug: str | None
    summary: str | None
    body: str | None
    category: str | None
    tags: list[str] | None
    is_published: bool
    author_user_id: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
