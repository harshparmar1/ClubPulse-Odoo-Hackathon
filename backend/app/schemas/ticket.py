from typing import Optional, List
from pydantic import BaseModel, Field

class TicketBookRequest(BaseModel):
    event_id: str
    quantity: int = Field(default=1, ge=1, le=10)
    attendee_names: Optional[List[str]] = None

class TicketResponse(BaseModel):
    id: str
    event_id: str
    event_title: str
    event_date: str
    venue: str
    user_id: str
    user_name: str
    user_email: str
    quantity: int
    total_amount_paise: int
    is_member_discount_applied: bool
    qr_token: str
    checked_in: bool
    checked_in_at: Optional[str] = None
    created_at: str

class TicketCheckInRequest(BaseModel):
    qr_token: str

class TicketCheckInResponse(BaseModel):
    success: bool
    message: str
    ticket_id: Optional[str] = None
    attendee_name: Optional[str] = None
    event_title: Optional[str] = None
    checked_in_at: Optional[str] = None
