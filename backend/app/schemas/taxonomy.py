from __future__ import annotations

from pydantic import BaseModel


class TaxonomyTermResponse(BaseModel):
    id: str
    category: str
    label: str
    internal_label: str | None = None
    slug: str
    sort_order: int
    is_active: bool
    aliases: list[str] | None = None

    model_config = {"from_attributes": True}


class TaxonomyTermCreate(BaseModel):
    category: str
    label: str
    internal_label: str | None = None
    slug: str
    sort_order: int = 0
    is_active: bool = True
    aliases: list[str] | None = None


class TaxonomyTermUpdate(BaseModel):
    label: str | None = None
    internal_label: str | None = None
    slug: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None
    aliases: list[str] | None = None
