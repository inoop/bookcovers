from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class UserAdminResponse(BaseModel):
    id: str
    external_id: str
    email: str
    display_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserRoleUpdateRequest(BaseModel):
    role: str


class UserActiveUpdateRequest(BaseModel):
    is_active: bool
