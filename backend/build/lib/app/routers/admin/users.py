from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.config import get_settings
from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.user import User
from app.schemas.user import UserAdminResponse, UserActiveUpdateRequest, UserRoleUpdateRequest
from app.services.auth import AuthUser

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])


@router.get("", response_model=list[UserAdminResponse])
async def list_users(
    role: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    stmt = sa.select(User).order_by(User.created_at.desc())
    if role:
        stmt = stmt.where(User.role == role)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.put("/{user_id}/role", response_model=UserAdminResponse)
async def update_user_role(
    user_id: str,
    body: UserRoleUpdateRequest,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.role = body.role
    await db.flush()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    current_user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(400, "Cannot delete your own account")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    # Remove from Cognito user pool if applicable
    settings = get_settings()
    if settings.AUTH_PROVIDER == "cognito" and user.external_id:
        import boto3
        from botocore.exceptions import ClientError

        cognito = boto3.client("cognito-idp", region_name=settings.COGNITO_REGION)
        try:
            cognito.admin_delete_user(
                UserPoolId=settings.COGNITO_USER_POOL_ID,
                Username=user.external_id,
            )
        except ClientError as e:
            if e.response["Error"]["Code"] != "UserNotFoundException":
                raise HTTPException(502, f"Failed to remove user from Cognito: {e}")

    await db.delete(user)
    await db.flush()


@router.put("/{user_id}/active", response_model=UserAdminResponse)
async def update_user_active(
    user_id: str,
    body: UserActiveUpdateRequest,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = body.is_active
    await db.flush()
    await db.refresh(user)
    return user
