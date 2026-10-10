from typing import List
from fastapi import APIRouter, Depends
from app.schemas.ticket import TicketBookRequest, TicketResponse, TicketCheckInRequest, TicketCheckInResponse
from app.services.ticket_service import TicketService
from app.core.dependencies import get_current_user, require_roles

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
    current_user: dict = Depends(require_roles(["organizer", "admin", "treasurer"]))
):
    return TicketService.check_in(data.qr_token, reviewer=current_user)
