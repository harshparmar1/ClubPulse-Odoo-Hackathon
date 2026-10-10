from typing import Optional, List
from pydantic import BaseModel, Field

class EventCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: str
    venue: str
    event_date: str  # ISO format string or YYYY-MM-DD HH:MM
    capacity: int = Field(..., gt=0)
    member_price_paise: int = Field(default=0, ge=0)
    non_member_price_paise: int = Field(default=10000, ge=0)  # ₹100
    banner_url: Optional[str] = None
    tags: List[str] = []
    is_published: bool = True
    required_volunteer_count: int = 5
    estimated_budget_paise: int = 2000000  # ₹20,000

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    event_date: Optional[str] = None
    capacity: Optional[int] = None
    member_price_paise: Optional[int] = None
    non_member_price_paise: Optional[int] = None
    banner_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None
    required_volunteer_count: Optional[int] = None
    estimated_budget_paise: Optional[int] = None

class EventResponse(BaseModel):
    id: str
    title: str
    description: str
    venue: str
    event_date: str
    capacity: int
    booked_count: int
    checked_in_count: int
    member_price_paise: int
    non_member_price_paise: int
    banner_url: Optional[str] = None
    tags: List[str] = []
    is_published: bool
    required_volunteer_count: int
    estimated_budget_paise: int
    created_at: str
