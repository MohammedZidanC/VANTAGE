"""
VANTAGE — Data Models
SQLAlchemy ORM models and Pydantic schemas.
"""

import datetime
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


# ─── SQLAlchemy ORM Models ───────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    user_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(String, ForeignKey("users.user_id"), nullable=False)

    owner = relationship("User", back_populates="tasks")


# ─── Pydantic Schemas ────────────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str
    user_id: str
    email: str
    password: str


class UserLogin(BaseModel):
    user_id: str
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    user_id: str
    email: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str


class TaskOut(BaseModel):
    id: int
    title: str
    completed: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    completed: bool
