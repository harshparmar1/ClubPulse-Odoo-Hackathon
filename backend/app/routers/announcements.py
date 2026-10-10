from typing import List
from fastapi import APIRouter, Depends
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from app.services.announcement_service import AnnouncementService
from app.core.dependencies import get_optional_current_user, require_roles

router = APIRouter(prefix="/api/announcements", tags=["Announcements"])

@router.get("", response_model=List[AnnouncementResponse])
def list_announcements(current_user: dict = Depends(get_optional_current_user)):
    return AnnouncementService.list_announcements(current_user=current_user)

@router.post("", response_model=AnnouncementResponse)
def create_announcement(
    data: AnnouncementCreate,
    current_user: dict = Depends(require_roles(["organizer", "admin"]))
):
    return AnnouncementService.create_announcement(data, current_user=current_user)
