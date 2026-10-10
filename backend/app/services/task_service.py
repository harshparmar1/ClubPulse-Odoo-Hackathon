import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import HTTPException
from app.database.mongodb import get_database
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

DEPARTMENTS = [
    "Branding",
    "Logistics",
    "Food & Beverages",
    "Technical",
    "Public Relations",
    "Operations",
    "Decorations & Stage",
    "Hospitality"
]

class TaskService:
    @staticmethod
    def list_tasks(event_id: Optional[str] = None, assignee_id: Optional[str] = None) -> List[TaskResponse]:
        db = get_database()
        query = {}
        if event_id:
            query["event_id"] = event_id
        if assignee_id:
            query["$or"] = [
                {"assignee_id": assignee_id},
                {"assignee_id": None},
                {"assignee_id": ""}
            ]

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
                department=doc.get("department") or "Operations",
                assignment_role=doc.get("assignment_role") or "Volunteer",
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

        dept = data.department or "Operations"
        role = data.assignment_role or "Volunteer"

        # Quota Validation if assigned to an event
        if data.event_id:
            if role == "Head":
                existing_heads = db["tasks"].count_documents({
                    "event_id": data.event_id,
                    "department": dept,
                    "assignment_role": "Head"
                })
                if existing_heads >= 1:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Department '{dept}' already has 1 Head assigned. Maximum limit is 1."
                    )
            elif role == "Sub-head":
                existing_subs = db["tasks"].count_documents({
                    "event_id": data.event_id,
                    "department": dept,
                    "assignment_role": "Sub-head"
                })
                if existing_subs >= 3:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Department '{dept}' already has 3 Sub-heads assigned. Maximum limit is 3."
                    )

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
            "department": dept,
            "assignment_role": role,
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
            department=dept,
            assignment_role=role,
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

        target_event_id = data.event_id if hasattr(data, 'event_id') and data.event_id is not None else task.get("event_id")
        target_dept = data.department if data.department is not None else task.get("department", "Operations")
        target_role = data.assignment_role if data.assignment_role is not None else task.get("assignment_role", "Volunteer")

        if target_event_id:
            if target_role == "Head":
                existing_heads = db["tasks"].count_documents({
                    "event_id": target_event_id,
                    "department": target_dept,
                    "assignment_role": "Head",
                    "id": {"$ne": task_id}
                })
                if existing_heads >= 1:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Department '{target_dept}' already has 1 Head assigned. Maximum limit is 1."
                    )
            elif target_role == "Sub-head":
                existing_subs = db["tasks"].count_documents({
                    "event_id": target_event_id,
                    "department": target_dept,
                    "assignment_role": "Sub-head",
                    "id": {"$ne": task_id}
                })
                if existing_subs >= 3:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Department '{target_dept}' already has 3 Sub-heads assigned. Maximum limit is 3."
                    )

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
            department=updated.get("department") or "Operations",
            assignment_role=updated.get("assignment_role") or "Volunteer",
            assignee_id=updated.get("assignee_id"),
            assignee_name=updated.get("assignee_name"),
            due_date=updated["due_date"],
            priority=updated.get("priority", "medium"),
            is_critical_path=updated.get("is_critical_path", False),
            status=updated.get("status", "todo"),
            is_overdue=is_overdue,
            created_at=updated.get("created_at", "")
        )

    @staticmethod
    def get_department_assignments(event_id: Optional[str] = None) -> dict:
        db = get_database()
        query = {}
        event_info = None
        if event_id:
            query["event_id"] = event_id
            ev_doc = db["events"].find_one({"id": event_id})
            if ev_doc:
                event_info = {
                    "id": ev_doc["id"],
                    "title": ev_doc["title"],
                    "event_date": ev_doc.get("event_date", ""),
                    "venue": ev_doc.get("venue", "")
                }

        tasks = list(db["tasks"].find(query))

        departments_data = []
        for dept in DEPARTMENTS:
            dept_tasks = [t for t in tasks if (t.get("department") or "Operations").lower() == dept.lower()]

            heads = []
            sub_heads = []
            volunteers = []

            for t in dept_tasks:
                assignee = {
                    "task_id": t["id"],
                    "task_title": t["title"],
                    "assignee_name": t.get("assignee_name") or "Unassigned",
                    "due_date": t.get("due_date", ""),
                    "status": t.get("status", "todo"),
                    "priority": t.get("priority", "medium"),
                    "is_critical_path": t.get("is_critical_path", False)
                }
                role = t.get("assignment_role") or "Volunteer"
                if role == "Head":
                    heads.append(assignee)
                elif role == "Sub-head":
                    sub_heads.append(assignee)
                else:
                    volunteers.append(assignee)

            departments_data.append({
                "department": dept,
                "head_quota": 1,
                "sub_head_quota": 3,
                "head_assigned": len(heads),
                "sub_head_assigned": len(sub_heads),
                "volunteer_assigned": len(volunteers),
                "head_remaining": max(0, 1 - len(heads)),
                "sub_head_remaining": max(0, 3 - len(sub_heads)),
                "heads": heads,
                "sub_heads": sub_heads,
                "volunteers": volunteers,
                "total_members": len(heads) + len(sub_heads) + len(volunteers)
            })

        return {
            "event": event_info,
            "event_id": event_id,
            "departments": departments_data
        }
