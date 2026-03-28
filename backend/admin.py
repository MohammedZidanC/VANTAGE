"""
VANTAGE — Admin Operations
View and manage all users. Restricted to admin user (mz8834).
"""

from flask import Blueprint, request, jsonify

from .database import SessionLocal
from .models import User, Task

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

ADMIN_USER_ID = "mz8834"

def verify_admin():
    """Simple admin verification via query parameter."""
    admin_id = request.args.get("admin_id")
    if admin_id != ADMIN_USER_ID:
        return False
    return True


@admin_bp.route("/users", methods=["GET"])
def get_all_users():
    """Return all registered users."""
    if not verify_admin():
        return jsonify({"error": "Admin access required."}), 403
        
    db = SessionLocal()
    try:
        users = db.query(User).all()
        return jsonify([user.to_dict() for user in users]), 200
    finally:
        db.close()

@admin_bp.route("/users/<user_id>/tasks", methods=["GET"])
def get_user_tasks(user_id):
    """Return all tasks for a specific user."""
    if not verify_admin():
        return jsonify({"error": "Admin access required."}), 403
        
    db = SessionLocal()
    try:
        tasks = db.query(Task).filter(Task.owner_id == user_id).all()
        return jsonify([task.to_dict() for task in tasks]), 200
    finally:
        db.close()


@admin_bp.route("/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    """Delete a user and all their tasks."""
    if not verify_admin():
        return jsonify({"error": "Admin access required."}), 403
        
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return jsonify({"error": "User not found."}), 404
            
        db.delete(user)
        db.commit()
        return jsonify({"message": f"User '{user_id}' deleted successfully."}), 200
    finally:
        db.close()
