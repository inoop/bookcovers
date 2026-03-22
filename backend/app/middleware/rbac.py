from collections.abc import Callable

from fastapi import Depends, HTTPException

from app.config import get_settings
from app.services.auth import AuthUser, get_current_user


def require_roles(*roles: str) -> Callable:
    """Dependency factory that enforces role-based access.

    In local dev mode, role checks are skipped — all authenticated users pass through.
    """

    async def _check_role(user: AuthUser = Depends(get_current_user)) -> AuthUser:
        settings = get_settings()
        if settings.ENVIRONMENT == "local":
            return user
        if user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role '{user.role}' does not have access to this resource",
            )
        return user

    return _check_role
