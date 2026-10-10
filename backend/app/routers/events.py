import base64
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services.event_service import EventService
from app.core.dependencies import get_current_user, get_optional_current_user, require_roles

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.post("/upload-banner")
async def upload_event_banner(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_roles(["organizer", "admin", "treasurer"]))
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image file exceeds 10MB limit.")
    encoded = base64.b64encode(contents).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{encoded}"
    return {"url": data_url, "filename": file.filename, "size": len(contents)}

@router.get("", response_model=List[EventResponse])
def list_events(
    published_only: Optional[bool] = None,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    # Only organizer role in organizer workspace can view unpublished drafts
    is_organizer = current_user and current_user.get("role") == "organizer"
    
    # Students, Admins, Treasurers, and Guests ONLY EVER receive published events
    if not is_organizer or published_only is True:
        return EventService.list_events(is_published_only=True)
    
    return EventService.list_events(is_published_only=published_only)

@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    return EventService.get_event(event_id, current_user=current_user)

@router.post("", response_model=EventResponse)
def create_event(
    data: EventCreate,
    current_user: dict = Depends(require_roles(["organizer", "admin", "treasurer"]))
):
    return EventService.create_event(data, current_user=current_user)

@router.patch("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: str,
    data: EventUpdate,
    current_user: dict = Depends(require_roles(["organizer", "admin", "treasurer"]))
):
    return EventService.update_event(event_id, data)

@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    current_user: dict = Depends(require_roles(["organizer", "admin", "treasurer"]))
):
    return EventService.delete_event(event_id)
