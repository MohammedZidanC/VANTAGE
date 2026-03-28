"""
VANTAGE — FastAPI Entry Point
Serves frontend static files and mounts API routers.
"""

import os
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from .database import init_db, get_db
from .models import Task, TaskCreate, TaskOut, TaskUpdate
from .auth import router as auth_router
from .admin import router as admin_router

app = FastAPI(title="VANTAGE", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(admin_router)


# ─── Task Endpoints ──────────────────────────────────────────────────

@app.get("/api/tasks", response_model=List[TaskOut])
def get_tasks(user_id: str = Query(...), db: Session = Depends(get_db)):
    """Get all tasks for a user."""
    return db.query(Task).filter(Task.owner_id == user_id).order_by(Task.created_at.desc()).all()


@app.post("/api/tasks", response_model=TaskOut)
def create_task(task: TaskCreate, user_id: str = Query(...), db: Session = Depends(get_db)):
    """Create a new task."""
    new_task = Task(title=task.title, owner_id=user_id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@app.patch("/api/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, update: TaskUpdate, db: Session = Depends(get_db)):
    """Toggle task completion."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    task.completed = update.completed
    db.commit()
    db.refresh(task)
    return task


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted."}


# ─── Startup ─────────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    init_db()


# ─── Serve Frontend Static Files ─────────────────────────────────────

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")

# Mount static subdirectories
app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")
app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")


@app.get("/")
def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


@app.get("/dashboard")
def serve_dashboard():
    return FileResponse(os.path.join(FRONTEND_DIR, "dashboard.html"))


@app.get("/info")
def serve_info():
    return FileResponse(os.path.join(FRONTEND_DIR, "info.html"))


@app.get("/about")
def serve_about():
    return FileResponse(os.path.join(FRONTEND_DIR, "about.html"))
