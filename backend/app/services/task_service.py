import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import HTTPException
from app.database.mongodb import get_database
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

class TaskService:
    @staticmethod
    def list_tasks(event_id: Optional[str] = None, assignee_id: Optional[str] = None) -> List[TaskResponse]:
        db = get_database()
        query = {}
        if event_id:
            query["event_id"] = event_id
        if assignee_id:
            query["assignee_id"] = assignee_id

        cursor = db["tasks"].find(query).sort("due_date", 1)
        today_str = date.today().isoformat()
        results = []
        for doc in cursor:
            is_overdue = (doc.get("due_date", "") < today_str) and (doc.get("status") != "done")
            results.append(TaskResponse(
                id=doc["id"],
                title=doc["title"],
                description=doc.get("description", ""),
                event_id=doc.get("event_id"),
                event_title=doc.get("event_title"),
                assignee_id=doc.get("assignee_id"),
                assignee_name=doc.get("assignee_name"),
                due_date=doc["due_date"],
                priority=doc.get("priority", "medium"),
                is_critical_path=doc.get("is_critical_path", False),
                status=doc.get("status", "todo"),
                is_overdue=is_overdue,
                created_at=doc.get("created_at", "")
            ))
        return results

    @staticmethod
    def create_task(data: TaskCreate, current_user: dict) -> TaskResponse:
        db = get_database()
        task_id = f"tsk_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()

        event_title = None
        if data.event_id:
            event = db["events"].find_one({"id": data.event_id})
            if event:
                event_title = event["title"]

        today_str = date.today().isoformat()
        is_overdue = (data.due_date < today_str) and (data.status != "done")

        doc = {
            "id": task_id,
            "title": data.title,
            "description": data.description or "",
            "event_id": data.event_id,
            "event_title": event_title,
            "assignee_id": data.assignee_id,
            "assignee_name": data.assignee_name,
            "due_date": data.due_date,
            "priority": data.priority,
            "is_critical_path": data.is_critical_path,
            "status": data.status,
            "created_by": current_user["id"],
            "created_at": now_iso
        }
        db["tasks"].insert_one(doc)

        return TaskResponse(
            id=task_id,
            title=data.title,
            description=doc["description"],
            event_id=data.event_id,
            event_title=event_title,
            assignee_id=data.assignee_id,
            assignee_name=data.assignee_name,
            due_date=data.due_date,
            priority=data.priority,
            is_critical_path=data.is_critical_path,
            status=data.status,
            is_overdue=is_overdue,
            created_at=now_iso
        )

    @staticmethod
    def update_task(task_id: str, data: TaskUpdate, current_user: dict) -> TaskResponse:
        db = get_database()
        task = db["tasks"].find_one({"id": task_id})
        if not task:
            raise HTTPException(status_code=404, detail="Task not found.")

        update_dict = {k: v for k, v in data.dict().items() if v is not None}
        if update_dict:
            db["tasks"].update_one({"id": task_id}, {"$set": update_dict})

        updated = db["tasks"].find_one({"id": task_id})
        today_str = date.today().isoformat()
        is_overdue = (updated.get("due_date", "") < today_str) and (updated.get("status") != "done")

        return TaskResponse(
            id=updated["id"],
            title=updated["title"],
            description=updated.get("description", ""),
            event_id=updated.get("event_id"),
            event_title=updated.get("event_title"),
            assignee_id=updated.get("assignee_id"),
            assignee_name=updated.get("assignee_name"),
            due_date=updated["due_date"],
            priority=updated.get("priority", "medium"),
            is_critical_path=updated.get("is_critical_path", False),
            status=updated.get("status", "todo"),
            is_overdue=is_overdue,
            created_at=updated.get("created_at", "")
        )
