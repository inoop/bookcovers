from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from fastapi import Depends, HTTPException, Request

from app.config import Settings, get_settings


@dataclass
class AuthUser:
    id: str
    email: str
    display_name: str
    role: str


class AuthService(Protocol):
    async def get_current_user(self, request: Request) -> AuthUser | None: ...


class LocalAuthService:
    """Dev auth: reads role from headers or returns a default admin user."""

    def __init__(self, settings: Settings):
        self.settings = settings

    async def get_current_user(self, request: Request) -> AuthUser | None:
        user_id = request.headers.get("X-Dev-User-Id", self.settings.DEV_USER_ID)
        role = request.headers.get("X-Dev-Role", self.settings.DEV_USER_ROLE)
        email = request.headers.get("X-Dev-Email", self.settings.DEV_USER_EMAIL)
        return AuthUser(
            id=user_id,
            email=email,
            display_name="Dev User",
            role=role,
        )


class CognitoAuthService:
    """AWS Cognito JWT validation."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self._jwks: dict | None = None

    async def _get_jwks(self) -> dict:
        if self._jwks is None:
            import httpx

            url = (
                f"https://cognito-idp.{self.settings.COGNITO_REGION}.amazonaws.com/"
                f"{self.settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
            )
            async with httpx.AsyncClient() as client:
                resp = await client.get(url)
                resp.raise_for_status()
                self._jwks = resp.json()
        return self._jwks

    async def get_current_user(self, request: Request) -> AuthUser | None:
        import jwt
        from jwt import PyJWKClient

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header[7:]
        try:
            jwks_url = (
                f"https://cognito-idp.{self.settings.COGNITO_REGION}.amazonaws.com/"
                f"{self.settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
            )
            jwk_client = PyJWKClient(jwks_url)
            signing_key = jwk_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=self.settings.COGNITO_APP_CLIENT_ID,
                issuer=(
                    f"https://cognito-idp.{self.settings.COGNITO_REGION}.amazonaws.com/"
                    f"{self.settings.COGNITO_USER_POOL_ID}"
                ),
            )
            return AuthUser(
                id=payload["sub"],
                email=payload.get("email", ""),
                display_name=payload.get("name", payload.get("email", "")),
                role=payload.get("custom:role", "hiring_user"),
            )
        except Exception:
            return None


def _get_auth_service(settings: Settings = Depends(get_settings)) -> AuthService:
    if settings.AUTH_PROVIDER == "cognito":
        return CognitoAuthService(settings)
    return LocalAuthService(settings)


async def get_current_user(
    request: Request,
    auth_service: AuthService = Depends(_get_auth_service),
) -> AuthUser:
    user = await auth_service.get_current_user(request)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


async def get_optional_user(
    request: Request,
    auth_service: AuthService = Depends(_get_auth_service),
) -> AuthUser | None:
    return await auth_service.get_current_user(request)
