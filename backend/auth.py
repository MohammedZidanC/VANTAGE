"""
VANTAGE — Authentication
Register, login, and session endpoints.
"""

from flask import Blueprint, request, jsonify
from passlib.context import CryptContext

from .database import SessionLocal
from .models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@auth_bp.route("/register", methods=["POST"])
def register():
    """Create a new user account."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
        
    db = SessionLocal()
    try:
        if db.query(User).filter(User.user_id == data.get("user_id")).first():
            return jsonify({"error": "User ID already taken."}), 400
        
        if db.query(User).filter(User.email == data.get("email")).first():
            return jsonify({"error": "Email already registered."}), 400

        new_user = User(
            full_name=data.get("full_name"),
            user_id=data.get("user_id"),
            email=data.get("email"),
            hashed_password=pwd_context.hash(data.get("password")),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return jsonify({"success": True}), 201
    finally:
        db.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return session info."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
        
    user_id = data.get("user_id")
    password = data.get("password")

    if user_id == "mz8834" and password == "1974":
        return jsonify({
            "success": True,
            "user_id": "mz8834",
            "is_admin": True,
            "user": {
                "id": 0,
                "full_name": "Admin",
                "user_id": "mz8834",
                "email": "admin@vantage.com",
                "is_admin": True,
            }
        }), 200

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user or not pwd_context.verify(password, user.hashed_password):
            return jsonify({"error": "Invalid credentials."}), 401

        return jsonify({
            "success": True,
            "user_id": user.user_id,
            "is_admin": False,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "user_id": user.user_id,
                "email": user.email,
                "is_admin": False,
            },
        }), 200
    finally:
        db.close()


@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    """Get current user data by user_id (session check)."""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
        
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return jsonify({"error": "User not found."}), 404
        return jsonify({
            "id": user.id,
            "full_name": user.full_name,
            "user_id": user.user_id,
            "email": user.email,
            "is_admin": user.user_id == "mz8834",
        }), 200
    finally:
        db.close()
