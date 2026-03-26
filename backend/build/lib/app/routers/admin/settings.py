from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.settings import AppSetting
from app.schemas.settings import SettingResponse, SettingUpdateRequest
from app.services.auth import AuthUser

router = APIRouter(prefix="/api/admin/settings", tags=["admin-settings"])

DEFAULT_SETTINGS = [
    ("featured_cta_text", "Discover top talent", "Text for the featured freelancers CTA"),
    ("newsletter_cta_text", "Stay in the loop", "Text for the newsletter signup CTA"),
    ("homepage_hero_title", "The Book Cover Artist Database", "Main headline on the homepage"),
    ("homepage_hero_subtitle", "Connecting PRH publishers and editors with curated freelance talent", "Subtitle text on the homepage"),
    ("max_portfolio_assets", "20", "Maximum portfolio assets a freelancer can upload"),
]


async def seed_default_settings(db: AsyncSession) -> None:
    for key, value, description in DEFAULT_SETTINGS:
        existing = await db.get(AppSetting, key)
        if not existing:
            db.add(AppSetting(key=key, value=value, description=description, updated_at=datetime.utcnow()))
    await db.flush()


@router.get("", response_model=list[SettingResponse])
async def list_settings(
    _user: AuthUser = Depends(require_roles("admin", "reviewer")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(sa.select(AppSetting).order_by(AppSetting.key))
    return list(result.scalars().all())


@router.put("/{key}", response_model=SettingResponse)
async def upsert_setting(
    key: str,
    body: SettingUpdateRequest,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    setting = await db.get(AppSetting, key)
    if setting:
        setting.value = body.value
        setting.updated_at = datetime.utcnow()
    else:
        setting = AppSetting(key=key, value=body.value, updated_at=datetime.utcnow())
        db.add(setting)
    await db.flush()
    await db.refresh(setting)
    return setting
