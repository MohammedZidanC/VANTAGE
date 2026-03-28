"""
VANTAGE — Admin Operations
View and manage all users. Restricted to admin user (mz8834).
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from .database import get_db
from .models import User, UserOut, Task, TaskOut

router = APIRouter(prefix="/api/admin", tags=["admin"])

ADMIN_USER_ID = "mz8834"


def verify_admin(admin_id: str = Query(...)):
    """Simple admin verification via query parameter."""
    if admin_id != ADMIN_USER_ID:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return admin_id


@router.get("/users", response_model=List[UserOut])
def get_all_users(
    admin_id: str = Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Return all registered users."""
    return db.query(User).all()


@router.get("/users/{user_id}/tasks", response_model=List[TaskOut])
def get_user_tasks(
    user_id: str,
    admin_id: str = Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Return all tasks for a specific user."""
    return db.query(Task).filter(Task.owner_id == user_id).all()


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    admin_id: str = Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Delete a user and all their tasks."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    db.delete(user)
    db.commit()
    return {"message": f"User '{user_id}' deleted successfully."}
