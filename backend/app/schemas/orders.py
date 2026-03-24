from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class BriefOrderResponse(BaseModel):
    id: str
    creative_brief_id: str
    amount: int
    currency: str
    payment_provider: str | None
    payment_status: str
    refund_status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConciergeOrderResponse(BaseModel):
    id: str
    creative_brief_id: str | None
    service_name: str
    amount: int
    currency: str
    payment_provider: str | None
    payment_status: str
    refund_status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class InquiryResponse(BaseModel):
    id: str
    name: str
    email: str
    subject: str | None
    message: str
    source_page: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class EmailSubscriptionResponse(BaseModel):
    id: str
    email: str
    is_confirmed: bool
    subscription_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
