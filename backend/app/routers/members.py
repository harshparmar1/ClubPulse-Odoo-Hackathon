from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.schemas.member import MemberCreate, MemberUpdate, MemberRenew, MemberResponse
from app.services.member_service import MemberService
from app.core.dependencies import get_current_user, get_optional_current_user, require_roles

router = APIRouter(prefix="/api/members", tags=["Memberships"])

@router.get("", response_model=List[MemberResponse])
def list_members(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(require_roles(["organizer", "treasurer", "admin"]))
):
    return MemberService.list_members(status_filter=status, search=search)

@router.post("", response_model=MemberResponse)
def create_member(data: MemberCreate, current_user: Optional[dict] = Depends(get_optional_current_user)):
    return MemberService.create_member(data, current_user=current_user)

@router.post("/{member_id}/renew", response_model=MemberResponse)
def renew_member(
    member_id: str,
    data: MemberRenew,
    current_user: dict = Depends(get_current_user)
):
    return MemberService.renew_membership(member_id, data)
