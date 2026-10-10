import uuid
import csv
import io
from datetime import datetime
from typing import List, Optional, Dict
from fastapi import HTTPException
from app.database.mongodb import get_database
from app.schemas.ledger import (
    TransactionCreate, TransactionResponse, FinancialSummaryResponse,
    ExpenseClaimCreate, ExpenseReviewRequest, ExpenseResponse
)

class LedgerService:
    @staticmethod
    def get_summary() -> FinancialSummaryResponse:
        db = get_database()
        cursor = db["transactions"].find()
        
        cash_received = 0
        cash_paid = 0
        pending_receivables = 0
        committed_obligations = 0
        category_breakdown: Dict[str, int] = {}

        for txn in cursor:
            t_type = txn.get("transaction_type")
            amt = txn.get("amount_paise", 0)
            status = txn.get("status")
            category = txn.get("category", "other")

            category_breakdown[category] = category_breakdown.get(category, 0) + amt

            if t_type == "income":
                if status == "completed":
                    cash_received += amt
                elif status == "pending":
                    pending_receivables += amt
            elif t_type == "expense":
                if status == "completed":
                    cash_paid += amt
                elif status in ["committed", "approved"]:
                    committed_obligations += amt

        net_liquid = cash_received - cash_paid

        return FinancialSummaryResponse(
            cash_received_paise=cash_received,
            cash_paid_paise=cash_paid,
            pending_receivables_paise=pending_receivables,
            committed_obligations_paise=committed_obligations,
            net_liquid_balance_paise=net_liquid,
            category_breakdown=category_breakdown
        )

    @staticmethod
    def list_transactions(category: Optional[str] = None, t_type: Optional[str] = None) -> List[TransactionResponse]:
        db = get_database()
        query = {}
        if category:
            query["category"] = category
        if t_type:
            query["transaction_type"] = t_type

        cursor = db["transactions"].find(query).sort("created_at", -1)
        results = []
        for doc in cursor:
            results.append(TransactionResponse(
                id=doc["id"],
                amount_paise=doc["amount_paise"],
                transaction_type=doc["transaction_type"],
                category=doc.get("category", "other"),
                description=doc.get("description", ""),
                status=doc.get("status", "completed"),
                reference_id=doc.get("reference_id"),
                event_id=doc.get("event_id"),
                created_at=doc.get("created_at", ""),
                created_by=doc.get("created_by")
            ))
        return results

    @staticmethod
    def create_transaction(data: TransactionCreate, current_user: dict) -> TransactionResponse:
        db = get_database()
        txn_id = f"txn_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()

        doc = {
            "id": txn_id,
            "amount_paise": data.amount_paise,
            "transaction_type": data.transaction_type,
            "category": data.category,
            "description": data.description,
            "status": data.status,
            "reference_id": data.reference_id,
            "event_id": data.event_id,
            "created_at": now_iso,
            "created_by": current_user["id"]
        }
        db["transactions"].insert_one(doc)
        return TransactionResponse(**{k: v for k, v in doc.items() if k != "_id"})

    @staticmethod
    def export_csv() -> str:
        transactions = LedgerService.list_transactions()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Transaction ID", "Date", "Type", "Category",
            "Amount (INR)", "Status", "Description", "Reference ID"
        ])
        for txn in transactions:
            writer.writerow([
                txn.id,
                txn.created_at[:10] if txn.created_at else "",
                txn.transaction_type.upper(),
                txn.category,
                f"{txn.amount_paise / 100:.2f}",
                txn.status.upper(),
                txn.description,
                txn.reference_id or ""
            ])
        return output.getvalue()

    # Expenses & Reimbursements
    @staticmethod
    def claim_expense(data: ExpenseClaimCreate, current_user: dict) -> ExpenseResponse:
        db = get_database()
        exp_id = f"exp_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()

        doc = {
            "id": exp_id,
            "user_id": current_user["id"],
            "user_name": current_user["full_name"],
            "user_email": current_user["email"],
            "amount_paise": data.amount_paise,
            "category": data.category,
            "description": data.description,
            "event_id": data.event_id,
            "receipt_url": data.receipt_url,
            "status": "pending",
            "reviewer_notes": None,
            "created_at": now_iso,
            "reviewed_at": None
        }
        db["expenses"].insert_one(doc)
        return ExpenseResponse(**{k: v for k, v in doc.items() if k != "_id"})

    @staticmethod
    def list_expenses(user_id: Optional[str] = None) -> List[ExpenseResponse]:
        db = get_database()
        query = {"user_id": user_id} if user_id else {}
        cursor = db["expenses"].find(query).sort("created_at", -1)
        results = []
        for doc in cursor:
            results.append(ExpenseResponse(
                id=doc["id"],
                user_id=doc["user_id"],
                user_name=doc["user_name"],
                user_email=doc["user_email"],
                amount_paise=doc["amount_paise"],
                category=doc.get("category", "logistics"),
                description=doc.get("description", ""),
                event_id=doc.get("event_id"),
                receipt_url=doc.get("receipt_url"),
                status=doc.get("status", "pending"),
                reviewer_notes=doc.get("reviewer_notes"),
                created_at=doc.get("created_at", ""),
                reviewed_at=doc.get("reviewed_at")
            ))
        return results

    @staticmethod
    def review_expense(expense_id: str, data: ExpenseReviewRequest, current_user: dict) -> ExpenseResponse:
        db = get_database()
        exp = db["expenses"].find_one({"id": expense_id})
        if not exp:
            raise HTTPException(status_code=404, detail="Expense claim not found.")

        now_iso = datetime.utcnow().isoformat()
        new_status = exp["status"]

        if data.action == "approve":
            new_status = "approved"
            # Record a committed obligation transaction
            db["transactions"].insert_one({
                "id": f"txn_{uuid.uuid4().hex[:10]}",
                "amount_paise": exp["amount_paise"],
                "transaction_type": "expense",
                "category": exp.get("category", "reimbursement"),
                "description": f"Approved reimbursement claim #{exp['id'][-6:]} for {exp['user_name']}",
                "status": "committed",
                "reference_id": exp["id"],
                "created_at": now_iso,
                "created_by": current_user["id"]
            })
        elif data.action == "reject":
            new_status = "rejected"
        elif data.action == "disburse":
            new_status = "disbursed"
            # Settle obligation -> create completed expense transaction
            # Remove any committed txn for this expense or update it
            db["transactions"].update_one(
                {"reference_id": exp["id"], "status": "committed"},
                {"$set": {"status": "completed", "created_at": now_iso}}
            )

        db["expenses"].update_one(
            {"id": expense_id},
            {
                "$set": {
                    "status": new_status,
                    "reviewer_notes": data.notes,
                    "reviewed_at": now_iso
                }
            }
        )
        updated = db["expenses"].find_one({"id": expense_id})
        return ExpenseResponse(**{k: v for k, v in updated.items() if k != "_id"})
