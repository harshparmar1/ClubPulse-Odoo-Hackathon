from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.ticket import TicketBookRequest, TicketResponse, TicketCheckInRequest, TicketCheckInResponse
from app.services.ticket_service import TicketService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])

@router.post("/book", response_model=TicketResponse)
def book_ticket(
    data: TicketBookRequest,
    current_user: dict = Depends(get_current_user)
):
    return TicketService.book_ticket(data, current_user=current_user)

@router.get("/my-tickets", response_model=List[TicketResponse])
def get_my_tickets(current_user: dict = Depends(get_current_user)):
    return TicketService.list_my_tickets(current_user=current_user)

@router.post("/check-in", response_model=TicketCheckInResponse)
def check_in_ticket(
    data: TicketCheckInRequest,
    current_user: dict = Depends(get_current_user)
):
    user_role = current_user.get("role", "student")
    membership_role = current_user.get("membership_role", "participant")
    is_active_member = current_user.get("membership_status") == "active"
    
    if user_role not in ["organizer", "admin", "treasurer"] and not (is_active_member and membership_role == "volunteer"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: requires organizer, admin, treasurer or active volunteer status to check in tickets."
        )
    return TicketService.check_in(data.qr_token, reviewer=current_user)
