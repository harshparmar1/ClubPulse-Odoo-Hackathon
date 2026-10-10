import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from app.database.mongodb import get_database
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse

class AnnouncementService:
    @staticmethod
    def list_announcements(current_user: Optional[dict] = None) -> List[AnnouncementResponse]:
        db = get_database()
        query = {"is_published": True}
        
        # Audience filtering
        role = current_user.get("role", "student") if current_user else "guest"
        is_member = current_user.get("membership_status") == "active" if current_user else False

        if role in ["organizer", "treasurer", "admin"]:
            # Organizers can see all
            query = {}
        elif is_member:
            query["target_audience"] = {"$in": ["all", "members_only"]}
        else:
            query["target_audience"] = "all"

        cursor = db["announcements"].find(query).sort("created_at", -1)
        results = []
        for doc in cursor:
            results.append(AnnouncementResponse(
                id=doc["id"],
                title=doc["title"],
                content=doc["content"],
                target_audience=doc.get("target_audience", "all"),
                priority=doc.get("priority", "normal"),
                is_published=doc.get("is_published", True),
                author_id=doc.get("author_id", "admin"),
                author_name=doc.get("author_name", "Executive Board"),
                created_at=doc.get("created_at", ""),
                updated_at=doc.get("updated_at", "")
            ))
        return results

    @staticmethod
    def create_announcement(data: AnnouncementCreate, current_user: dict) -> AnnouncementResponse:
        db = get_database()
        ann_id = f"ann_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()

        doc = {
            "id": ann_id,
            "title": data.title,
            "content": data.content,
            "target_audience": data.target_audience,
            "priority": data.priority,
            "is_published": data.is_published,
            "author_id": current_user["id"],
            "author_name": current_user["full_name"],
            "created_at": now_iso,
            "updated_at": now_iso
        }
        db["announcements"].insert_one(doc)
        return AnnouncementResponse(**{k: v for k, v in doc.items() if k != "_id"})

    @staticmethod
    def update_announcement(announcement_id: str, data: AnnouncementUpdate, current_user: dict) -> AnnouncementResponse:
        db = get_database()
        doc = db["announcements"].find_one({"id": announcement_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Announcement not found.")

        update_data = {k: v for k, v in data.dict().items() if v is not None}
        if update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            db["announcements"].update_one({"id": announcement_id}, {"$set": update_data})

        updated = db["announcements"].find_one({"id": announcement_id})
        return AnnouncementResponse(**{k: v for k, v in updated.items() if k != "_id"})

    @staticmethod
    def delete_announcement(announcement_id: str, current_user: dict) -> dict:
        db = get_database()
        res = db["announcements"].delete_one({"id": announcement_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Announcement not found.")
        return {"success": True, "message": "Announcement deleted successfully."}

