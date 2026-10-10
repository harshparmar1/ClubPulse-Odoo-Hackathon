from typing import List
from fastapi import APIRouter, Depends
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services.event_service import EventService
from app.core.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.get("", response_model=List[EventResponse])
def list_events():
    return EventService.list_events()

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str):
    return EventService.get_event(event_id)

@router.post("", response_model=EventResponse)
def create_event(
    data: EventCreate,
    current_user: dict = Depends(require_roles(["organizer", "admin"]))
):
    return EventService.create_event(data, current_user=current_user)

@router.patch("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: str,
    data: EventUpdate,
    current_user: dict = Depends(require_roles(["organizer", "admin"]))
):
    return EventService.update_event(event_id, data)
