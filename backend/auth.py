"""
VANTAGE — Authentication
Register, login, and session endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from .database import get_db
from .models import User, UserRegister, UserLogin, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register", response_model=UserOut)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Create a new user account."""
    # Check for existing user_id
    if db.query(User).filter(User.user_id == data.user_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID already taken.",
        )
    # Check for existing email
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    new_user = User(
        full_name=data.full_name,
        user_id=data.user_id,
        email=data.email,
        hashed_password=pwd_context.hash(data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return session info."""
    user = db.query(User).filter(User.user_id == data.user_id).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    # Check if admin
    is_admin = data.user_id == "mz8834"

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "user_id": user.user_id,
            "email": user.email,
            "is_admin": is_admin,
        },
    }


@router.get("/me")
def get_current_user(user_id: str, db: Session = Depends(get_db)):
    """Get current user data by user_id (session check)."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "id": user.id,
        "full_name": user.full_name,
        "user_id": user.user_id,
        "email": user.email,
        "is_admin": user.user_id == "mz8834",
    }
