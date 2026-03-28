"""
VANTAGE — Flask Entry Point
Serves frontend static files and mounts API blueprints.
"""

import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from .database import init_db, SessionLocal
from .models import Task
from .auth import auth_bp
from .admin import admin_bp

app = Flask(__name__)

# CORS
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

# ─── Task Endpoints ──────────────────────────────────────────────────

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    """Get all tasks for a user."""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400
        
    db = SessionLocal()
    try:
        tasks = db.query(Task).filter(Task.owner_id == user_id).order_by(Task.created_at.desc()).all()
        return jsonify([task.to_dict() for task in tasks]), 200
    finally:
        db.close()


@app.route("/api/tasks", methods=["POST"])
def create_task():
    """Create a new task."""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400
        
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Invalid data"}), 400
        
    db = SessionLocal()
    try:
        new_task = Task(title=data["title"], owner_id=user_id)
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        return jsonify(new_task.to_dict()), 201
    finally:
        db.close()


@app.route("/api/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    """Toggle task completion."""
    data = request.get_json()
    if not data or "completed" not in data:
        return jsonify({"error": "Invalid JSON or missing completed status"}), 400
        
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return jsonify({"error": "Task not found."}), 404
            
        task.completed = data.get("completed")
        db.commit()
        db.refresh(task)
        return jsonify(task.to_dict()), 200
    finally:
        db.close()


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """Delete a task."""
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return jsonify({"error": "Task not found."}), 404
            
        db.delete(task)
        db.commit()
        return jsonify({"message": "Task deleted."}), 200
    finally:
        db.close()


# ─── Startup ─────────────────────────────────────────────────────────

with app.app_context():
    init_db()


# ─── Serve Frontend Static Files ─────────────────────────────────────

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")

@app.route("/")
def root():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/dashboard")
def serve_dashboard():
    return send_from_directory(FRONTEND_DIR, "dashboard.html")

@app.route("/info")
def serve_info():
    return send_from_directory(FRONTEND_DIR, "info.html")

@app.route("/about")
def serve_about():
    return send_from_directory(FRONTEND_DIR, "about.html")

@app.route("/css/<path:filename>")
def serve_css(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, "css"), filename)

@app.route("/js/<path:filename>")
def serve_js(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, "js"), filename)

@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, "assets"), filename)

@app.route("/<path:filename>")
def serve_root_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
