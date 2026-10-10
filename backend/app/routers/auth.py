from fastapi import APIRouter, Depends
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister):
    return AuthService.register(data)

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin):
    return AuthService.login(data)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        roll_number=current_user.get("roll_number"),
        phone=current_user.get("phone"),
        role=current_user.get("role", "student"),
        membership_status=current_user.get("membership_status", "non_member"),
        membership_expiry=current_user.get("membership_expiry"),
        membership_tier=current_user.get("membership_tier", "annual"),
        membership_role=current_user.get("membership_role", "participant"),
        created_at=current_user.get("created_at", "")
    )
