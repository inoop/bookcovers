from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class ConciergePackageCreate(BaseModel):
    name: str
    description: str | None = None
    price_cents: int
    currency: str = "USD"
    is_active: bool = True


class ConciergePackageUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price_cents: int | None = None
    currency: str | None = None
    is_active: bool | None = None


class ConciergePackageResponse(BaseModel):
    id: str
    name: str
    description: str | None
    price_cents: int
    currency: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
