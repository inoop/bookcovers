from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.concierge import ConciergePackage
from app.schemas.concierge import (
    ConciergePackageCreate,
    ConciergePackageResponse,
    ConciergePackageUpdate,
)
from app.services.auth import AuthUser

router = APIRouter(prefix="/api/admin/concierge", tags=["admin-concierge"])


@router.get("/packages", response_model=list[ConciergePackageResponse])
async def list_packages(
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        sa.select(ConciergePackage).order_by(ConciergePackage.name)
    )
    return list(result.scalars().all())


@router.post("/packages", response_model=ConciergePackageResponse, status_code=201)
async def create_package(
    body: ConciergePackageCreate,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    package = ConciergePackage(**body.model_dump())
    db.add(package)
    await db.flush()
    await db.refresh(package)
    return package


@router.put("/packages/{package_id}", response_model=ConciergePackageResponse)
async def update_package(
    package_id: str,
    body: ConciergePackageUpdate,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    package = await db.get(ConciergePackage, package_id)
    if not package:
        raise HTTPException(404, "Package not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(package, field, value)
    await db.flush()
    await db.refresh(package)
    return package


@router.delete("/packages/{package_id}", status_code=204)
async def delete_package(
    package_id: str,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    package = await db.get(ConciergePackage, package_id)
    if not package:
        raise HTTPException(404, "Package not found")
    await db.delete(package)
