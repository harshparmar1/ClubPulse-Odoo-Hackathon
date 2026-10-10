from typing import List
from fastapi import APIRouter, Depends
from app.schemas.ledger import ExpenseClaimCreate, ExpenseReviewRequest, ExpenseResponse
from app.services.ledger_service import LedgerService
from app.core.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/expenses", tags=["Expenses & Reimbursements"])

@router.post("/claim", response_model=ExpenseResponse)
def submit_claim(
    data: ExpenseClaimCreate,
    current_user: dict = Depends(get_current_user)
):
    return LedgerService.claim_expense(data, current_user=current_user)

@router.get("/my-claims", response_model=List[ExpenseResponse])
def get_my_claims(current_user: dict = Depends(get_current_user)):
    return LedgerService.list_expenses(user_id=current_user["id"])

@router.get("", response_model=List[ExpenseResponse])
def list_all_expenses(
    current_user: dict = Depends(require_roles(["treasurer", "admin"]))
):
    return LedgerService.list_expenses()

@router.patch("/{expense_id}/review", response_model=ExpenseResponse)
def review_expense(
    expense_id: str,
    data: ExpenseReviewRequest,
    current_user: dict = Depends(require_roles(["treasurer", "admin"]))
):
    return LedgerService.review_expense(expense_id, data, current_user=current_user)
