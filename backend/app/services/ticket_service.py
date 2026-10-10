import uuid
from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from app.database.mongodb import get_database
from app.schemas.ticket import TicketBookRequest, TicketResponse, TicketCheckInResponse

class TicketService:
    @staticmethod
    def book_ticket(data: TicketBookRequest, current_user: dict) -> TicketResponse:
        db = get_database()
        event = db["events"].find_one({"id": data.event_id})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found.")
        
        if not event.get("is_published", False):
            raise HTTPException(status_code=400, detail="Event is not published for booking.")

        if event.get("is_ended", False) or event.get("status") == "ended":
            raise HTTPException(status_code=400, detail="This event has concluded. Ticket bookings are closed.")

        # Check membership status for discount
        is_member = current_user.get("membership_status") == "active"
        unit_price = event["member_price_paise"] if is_member else event["non_member_price_paise"]
        total_amount = unit_price * data.quantity

        # Atomic capacity lock
        # Update booked_count ONLY IF current booked_count + quantity <= capacity
        update_result = db["events"].update_one(
            {
                "id": data.event_id,
                "$expr": {
                    "$lte": [
                        {"$add": ["$booked_count", data.quantity]},
                        "$capacity"
                    ]
                }
            },
            {"$inc": {"booked_count": data.quantity}}
        )

        if update_result.modified_count == 0:
            # Check if sold out
            current_event = db["events"].find_one({"id": data.event_id})
            remaining = current_event["capacity"] - current_event.get("booked_count", 0)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot book {data.quantity} ticket(s). Only {max(0, remaining)} seats remain."
            )

        ticket_id = f"tkt_{uuid.uuid4().hex[:10]}"
        qr_token = f"CP-TKT-{data.event_id[:5]}-{uuid.uuid4().hex[:8].upper()}"
        now_iso = datetime.utcnow().isoformat()
        role_track = (data.role_track or "participant").lower()
        if role_track not in ["participant", "volunteer"]:
            role_track = "participant"

        # If user is active member and registers as volunteer, update membership_role
        if is_member and role_track == "volunteer":
            db["users"].update_one(
                {"id": current_user["id"]},
                {"$set": {"membership_role": "volunteer"}}
            )
            db["members"].update_one(
                {"$or": [{"user_id": current_user["id"]}, {"email": current_user["email"].lower()}]},
                {"$set": {"membership_role": "volunteer"}}
            )

        ticket_doc = {
            "id": ticket_id,
            "event_id": event["id"],
            "event_title": event["title"],
            "event_date": event["event_date"],
            "venue": event["venue"],
            "user_id": current_user["id"],
            "user_name": current_user["full_name"],
            "user_email": current_user["email"],
            "quantity": data.quantity,
            "total_amount_paise": total_amount,
            "is_member_discount_applied": is_member,
            "role_track": role_track,
            "qr_token": qr_token,
            "checked_in": False,
            "checked_in_at": None,
            "created_at": now_iso
        }
        db["tickets"].insert_one(ticket_doc)

        # Record income transaction in the ledger
        if total_amount > 0:
            db["transactions"].insert_one({
                "id": f"txn_{uuid.uuid4().hex[:10]}",
                "amount_paise": total_amount,
                "transaction_type": "income",
                "category": "ticket_sale",
                "description": f"Ticket booking ({role_track.capitalize()}) for {event['title']} ({data.quantity} tickets by {current_user['full_name']})",
                "status": "completed",
                "reference_id": ticket_id,
                "event_id": event["id"],
                "created_at": now_iso,
                "created_by": current_user["id"]
            })

        return TicketResponse(**{k: v for k, v in ticket_doc.items() if k != "_id"})

    @staticmethod
    def list_my_tickets(current_user: dict) -> List[TicketResponse]:
        db = get_database()
        cursor = db["tickets"].find({"user_id": current_user["id"]}).sort("created_at", -1)
        results = []
        for doc in cursor:
            results.append(TicketResponse(
                id=doc["id"],
                event_id=doc["event_id"],
                event_title=doc["event_title"],
                event_date=doc["event_date"],
                venue=doc["venue"],
                user_id=doc["user_id"],
                user_name=doc["user_name"],
                user_email=doc["user_email"],
                quantity=doc["quantity"],
                total_amount_paise=doc["total_amount_paise"],
                is_member_discount_applied=doc.get("is_member_discount_applied", False),
                role_track=doc.get("role_track", "participant"),
                qr_token=doc["qr_token"],
                checked_in=doc.get("checked_in", False),
                checked_in_at=doc.get("checked_in_at"),
                created_at=doc.get("created_at", "")
            ))
        return results

    @staticmethod
    def check_in(qr_token: str, reviewer: dict) -> TicketCheckInResponse:
        db = get_database()
        ticket = db["tickets"].find_one({"qr_token": qr_token.strip()})
        if not ticket:
            return TicketCheckInResponse(
                success=False,
                message="Invalid ticket QR code. No booking record found."
            )
        
        if ticket.get("checked_in", False):
            check_in_time = ticket.get("checked_in_at", "earlier")
            return TicketCheckInResponse(
                success=False,
                message=f"Duplicate check-in rejected! Ticket was already checked in at {check_in_time}.",
                ticket_id=ticket["id"],
                attendee_name=ticket["user_name"],
                event_title=ticket["event_title"],
                checked_in_at=check_in_time
            )

        now_iso = datetime.utcnow().isoformat()
        
        # Atomic check-in
        updated = db["tickets"].find_one_and_update(
            {"qr_token": qr_token.strip(), "checked_in": False},
            {"$set": {"checked_in": True, "checked_in_at": now_iso}}
        )

        if not updated:
            return TicketCheckInResponse(
                success=False,
                message="Check-in conflict. Ticket may have just been verified on another terminal."
            )

        # Increment attendance on the event
        db["events"].update_one(
            {"id": ticket["event_id"]},
            {"$inc": {"checked_in_count": ticket.get("quantity", 1)}}
        )

        return TicketCheckInResponse(
            success=True,
            message=f"Verified! Welcome {ticket['user_name']} ({ticket['quantity']} attendee(s)).",
            ticket_id=ticket["id"],
            attendee_name=ticket["user_name"],
            event_title=ticket["event_title"],
            checked_in_at=now_iso
        )
