import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from app.database.mongodb import get_database
from app.schemas.event import EventCreate, EventUpdate, EventResponse

class EventService:
    @staticmethod
    def list_events(is_published_only: bool = False) -> List[EventResponse]:
        db = get_database()
        query = {}
        if is_published_only:
            query["is_published"] = True
        
        cursor = db["events"].find(query).sort("event_date", 1)
        results = []
        for doc in cursor:
            results.append(EventResponse(
                id=doc["id"],
                title=doc["title"],
                description=doc["description"],
                venue=doc["venue"],
                event_date=doc["event_date"],
                capacity=doc["capacity"],
                booked_count=doc.get("booked_count", 0),
                checked_in_count=doc.get("checked_in_count", 0),
                member_price_paise=doc["member_price_paise"],
                non_member_price_paise=doc["non_member_price_paise"],
                banner_url=doc.get("banner_url"),
                tags=doc.get("tags", []),
                is_published=doc.get("is_published", True),
                required_volunteer_count=doc.get("required_volunteer_count", 5),
                estimated_budget_paise=doc.get("estimated_budget_paise", 2000000),
                created_at=doc.get("created_at", "")
            ))
        return results

    @staticmethod
    def get_event(event_id: str) -> EventResponse:
        db = get_database()
        doc = db["events"].find_one({"id": event_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Event not found.")
        return EventResponse(
            id=doc["id"],
            title=doc["title"],
            description=doc["description"],
            venue=doc["venue"],
            event_date=doc["event_date"],
            capacity=doc["capacity"],
            booked_count=doc.get("booked_count", 0),
            checked_in_count=doc.get("checked_in_count", 0),
            member_price_paise=doc["member_price_paise"],
            non_member_price_paise=doc["non_member_price_paise"],
            banner_url=doc.get("banner_url"),
            tags=doc.get("tags", []),
            is_published=doc.get("is_published", True),
            required_volunteer_count=doc.get("required_volunteer_count", 5),
            estimated_budget_paise=doc.get("estimated_budget_paise", 2000000),
            created_at=doc.get("created_at", "")
        )

    @staticmethod
    def create_event(data: EventCreate, current_user: dict) -> EventResponse:
        db = get_database()
        event_id = f"evt_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()
        
        event_doc = {
            "id": event_id,
            "title": data.title,
            "description": data.description,
            "venue": data.venue,
            "event_date": data.event_date,
            "capacity": data.capacity,
            "booked_count": 0,
            "checked_in_count": 0,
            "member_price_paise": data.member_price_paise,
            "non_member_price_paise": data.non_member_price_paise,
            "banner_url": data.banner_url,
            "tags": data.tags,
            "is_published": data.is_published,
            "required_volunteer_count": data.required_volunteer_count,
            "estimated_budget_paise": data.estimated_budget_paise,
            "created_by": current_user.get("id"),
            "created_at": now_iso
        }
        db["events"].insert_one(event_doc)
        return EventResponse(**{k: v for k, v in event_doc.items() if k != "_id" and k != "created_by"})

    @staticmethod
    def update_event(event_id: str, data: EventUpdate) -> EventResponse:
        db = get_database()
        event = db["events"].find_one({"id": event_id})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found.")
        
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        if update_data:
            db["events"].update_one({"id": event_id}, {"$set": update_data})
        
        updated = db["events"].find_one({"id": event_id})
        return EventResponse(**{k: v for k, v in updated.items() if k != "_id" and k != "created_by"})
