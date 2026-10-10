import uuid
from datetime import datetime
from fastapi import HTTPException, status
from app.database.mongodb import get_database
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse

class AuthService:
    @staticmethod
    def register(data: UserRegister) -> TokenResponse:
        db = get_database()
        existing = db["users"].find_one({"email": data.email.lower()})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists."
            )
        
        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.utcnow().isoformat()
        
        user_doc = {
            "id": user_id,
            "email": data.email.lower(),
            "hashed_password": hash_password(data.password),
            "full_name": data.full_name,
            "roll_number": data.roll_number or "STU-001",
            "phone": data.phone,
            "role": data.role if data.role in ["student", "organizer", "treasurer", "admin"] else "student",
            "membership_status": "non_member",
            "membership_expiry": None,
            "created_at": now_iso
        }
        
        db["users"].insert_one(user_doc)
        
        # Issue token
        token = create_access_token({"sub": user_id, "role": user_doc["role"]})
        
        user_res = UserResponse(
            id=user_doc["id"],
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            roll_number=user_doc["roll_number"],
            phone=user_doc["phone"],
            role=user_doc["role"],
            membership_status=user_doc["membership_status"],
            membership_expiry=user_doc["membership_expiry"],
            created_at=user_doc["created_at"]
        )
        return TokenResponse(access_token=token, user=user_res)

    @staticmethod
    def login(data: UserLogin) -> TokenResponse:
        db = get_database()
        user_doc = db["users"].find_one({"email": data.email.lower()})
        if not user_doc or not verify_password(data.password, user_doc.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )
        
        token = create_access_token({"sub": user_doc["id"], "role": user_doc.get("role", "student")})
        
        user_res = UserResponse(
            id=user_doc["id"],
            email=user_doc["email"],
            full_name=user_doc["full_name"],
            roll_number=user_doc.get("roll_number"),
            phone=user_doc.get("phone"),
            role=user_doc.get("role", "student"),
            membership_status=user_doc.get("membership_status", "non_member"),
            membership_expiry=user_doc.get("membership_expiry"),
            created_at=user_doc.get("created_at", datetime.utcnow().isoformat())
        )
        return TokenResponse(access_token=token, user=user_res)
