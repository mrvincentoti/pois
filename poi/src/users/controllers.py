from flask import request, jsonify, json, g
import os, jwt, redis
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from ..redis_manager import get_token, remove_token, custom_jwt_required
from ..rabbitmq_manager import publish_to_rabbitmq
from datetime import datetime as dt
from .. import db
from .models import User
from sqlalchemy import or_
from sqlalchemy.orm import joinedload, class_mapper
from ..roles.models import Role
from ..modules.models import Module
from ..permissions.models import Permission
from ..rolePermissions.models import RolePermission
from ..util import encrypt, decrypt, save_audit_data

REDIS_HOST = os.getenv("REDIS_HOST")
redis_client = redis.StrictRedis(host=REDIS_HOST, port=6379, decode_responses=True)


def parsePermissions(permissions):
    role_permissions = []
    for item in permissions:
        permission = {
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "module_id": item.module_id,
            "group": item.group,
        }
        role_permissions.append(permission)

    return role_permissions


# @custom_jwt_required
def create_user():
    data = request.get_json()
    email = data["email"] if 'email' in data else None
    username = data["username"]
    password = "password"  # data["password"]
    role_id = data["role_id"]
    employee_id = data['employee_id'] if 'employee_id' in data else None
    first_name = data["first_name"]
    last_name = data["last_name"]
    pfs_num = data["pfs_num"]

    response = {}  # Initialize the response dictionary

    try:
        user = User(email=email, username=username, password=password, role_id=role_id, employee_id=employee_id,
                    first_name=first_name, last_name=last_name, pfs_num=pfs_num)

        db.session.add(user)
        db.session.commit()

        current_time = dt.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "event": encrypt("add_user"),
            "auditable_id": user.id,
            "old_values": None,
            "new_values": encrypt(json.dumps(
                {"email": email, "username": username, "password": password, "role_id": role_id,
                 "employee_id": employee_id}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Account, Users, Create"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response["status"] = "success"
        response["status_code"] = 201  # 201 Created
        response["message"] = "User created successfully"
    except IntegrityError as e:
        db.session.rollback()
        response["status"] = "error"
        response["status_code"] = 400  # 400 Bad Request
        response[
            "message"
        ] = f"User creation failed. Email or username may already exist: {str(e)}"
    except Exception as e:
        db.session.rollback()
        response["status"] = "error"
        response["status_code"] = 500  # 500 Internal Server Error
        response["message"] = f"An error occurred while creating the user: {str(e)}"

    return jsonify(response), response["status_code"]


@custom_jwt_required
def list_users():
    try:
        # Get query parameters for pagination
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)

        # Get query parameters for pagination
        search_query = request.args.get("q", "")

        # Base query
        users_query = User.query.filter(User.deleted_at.is_(None))  # Filter non-deleted users

        # Join the Role table
        users_query = users_query.join(Role)

        # If search query is not empty
        if search_query:
            users_query = users_query.filter(
                or_(
                    User.email.ilike(f"%{search_query}%"),
                    User.username.ilike(f"%{search_query}%"),
                    Role.name.ilike(f"%{search_query}%"),
                )
            )

        # Paginate the User query with joined Role information
        users_paginated = (
            users_query.options(joinedload(User.role))
            .paginate(page=page, per_page=per_page)
        )

        user_list = []
        for user in users_paginated.items:
            user_data = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "is_active": user.is_active,
                "is_first_time": user.is_first_time,
                "last_login_time": (
                    user.last_login_time.strftime("%Y-%m-%d %H:%M:%S")
                    if user.last_login_time
                    else None
                ),
                "deleted_at": (
                    user.deleted_at.strftime("%Y-%m-%d %H:%M:%S")
                    if user.deleted_at
                    else None
                ),
                "role": {
                    "id": user.role.id,
                    "name": user.role.name,
                } if user.role else None,
            }
            user_list.append(user_data)

            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "event": encrypt("list_users"),
                "auditable_id": None,
                "old_values": None,
                "new_values": None,
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Account, Users, List"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

        response = {
            "status": "success",
            "status_code": 200,
            "users": user_list,
            "total_pages": users_paginated.pages,
            "current_page": users_paginated.page,
            "total_items": users_paginated.total,
        }
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of users: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if user is not None:
            # Serialize the user object
            user_data = {
                "user_id": user.id,
                "email": user.email,
                "username": user.username,
                "role": {
                    "id": user.role.id,
                    "name": user.role.name,
                } if user.role else None,
                "is_active": user.is_active,
                "is_first_time": user.is_first_time,
                "last_login_time": user.last_login_time.strftime("%Y-%m-%d %H:%M:%S") if user.last_login_time else None,
                "deleted_at": user.deleted_at.strftime("%Y-%m-%d %H:%M:%S") if user.deleted_at else None,
            }

            response = {
                "status": "success",
                "status_code": 200,
                "user_data": user_data,
                "role_permission": parsePermissions(user.role.permissions) if user.role else [],
            }
        else:
            response = {
                "status": "error",
                "status_code": 404,
                "message": "User not found",
            }
    except Exception as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": "An error occurred while retrieving the user.",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if user is not None:
            data = request.get_json()

            new_value = {
                "email": data.get("email", user.email),
                "username": data.get("username", user.username),
                "is_active": data.get("is_active", user.is_active),
                "role_id": data.get("role_id", user.role_id)
            }

            old_values = {
                "email": user.email,
                "username": user.username,
                "password": user.password,
                "role_id": user.role_id,
                "employee_id": user.employee_id
            }

            user_username = data.get("username", user.username)
            user_email = data.get("email", user.email)
            user_role_id = data.get("role_id", user.role_id)
            user.update(username=user_username, role_id=user_role_id, email=user_email)

            current_time = dt.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "event": encrypt("edit_user"),
                "auditable_id": user.id,
                "old_values": encrypt(json.dumps(
                    old_values
                )),
                "new_values": encrypt(json.dumps(
                    new_value
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Account, Users, Update"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response = {
                "status": "success",
                "status_code": 200,
                "message": "User updated successfully",
            }
        else:
            response = {
                "status": "error",
                "status_code": 404,
                "message": "User not found",
            }
    except Exception as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while updating user: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def soft_delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if user is not None:
            user.soft_delete()
            db.session.commit()

            current_time = dt.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "event": "delete_user",
                "auditable_id": user.id,
                "old_values": json.dumps(
                    {"email": user.email, "username": user.username, "password": user.password,
                     "role_id": user.role_id, "employee_id": user.employee_id}
                ),
                "new_values": None,
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "User, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response = {
                "status": "success",
                "status_code": 200,
                "message": "User soft-deleted successfully",
            }
        else:
            response = {
                "status": "error",
                "status_code": 404,
                "message": "User not found",
            }
    except Exception as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": "An error occurred while soft-deleting the user.",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def restore_user(user_id):
    user = User.query.get(user_id)

    if user is not None and user.deleted_at:
        # Restore the user by setting deleted to False and clearing deleted_at
        user.deleted_at = None
        db.session.commit()

        current_time = dt.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "event": "restore_user",
            "auditable_id": user.id,
            "old_values": json.dumps(
                {"email": user.email, "username": user.username, "password": user.password,
                 "role_id": user.role_id, "employee_id": user.employee_id}
            ),
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Auth, User, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response = {
            "status": "success",
            "status_code": 200,
            "message": "User restored successfully",
        }
    elif user is not None and not user.deleted_at:
        response = {
            "status": "error",
            "status_code": 400,
            "message": "User is not soft-deleted",
        }
    else:
        response = {"status": "error", "status_code": 404, "message": "User not found"}

    return jsonify(response), response["status_code"]


def login_user():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        # Authenticate the user (replace with your authentication logic)
        user = User.query.filter_by(username=username).first()


        if user is None or not user.check_password(password):
            return jsonify({"message": "Invalid credentials"}), 401

        # Update the last_login_time
        user.last_login_time = datetime.utcnow()
        db.session.commit()

        current_time = dt.utcnow()
        audit_data = {
            "user_id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "pfs_num": user.pfs_num,
            "event": "user_login",
            "auditable_id": user.id,
            "old_values": json.dumps(
                {
                    "email": user.email,
                    "username": user.username,
                    "password": user.password,
                    "role_id": user.role_id,
                    "user_id": user.id
                }
            ),
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Auth, User, Login",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat()
        }

        save_audit_data(audit_data)

        expiration = datetime.utcnow() + timedelta(hours=1)
        payload = {
            "sub": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "pfs_num": user.pfs_num,
            "exp": expiration.timestamp()  # Use timestamp for expiration
        }

        # Load the secret key from the environment variable
        secret_key = os.getenv("SECRET_KEY")

        if not secret_key:
            return jsonify({"message": "Secret key not found"}), 500

        token = jwt.encode(payload, secret_key, algorithm="HS256")
        expiration_time = current_time + timedelta(hours=1)
        # Serialize the user object
        user_data = {
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
            "employee_id": user.employee_id,
            "role": {
                "id": user.role.id,
                "name": user.role.name,
            } if user.role else None,
            "is_active": user.is_active,
            "is_first_time": user.is_first_time,
            "last_login_time": user.last_login_time,
        }

        return (
            jsonify(
                {
                    "user": user_data,
                    "role_permission": parsePermissions(user.role.permissions) if user.role else [],
                    "token": token,
                    "expiration": expiration_time.isoformat(),
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@custom_jwt_required
def logout_user():
    try:
        token = request.headers.get("Authorization").split()[1]
        if not get_token(token):
            return jsonify({"message": "Token not found in Redis"}), 401

        remove_token(token)
        current_time = dt.utcnow()

        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "event": encrypt("user_logout"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Auth, User, Logout"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return (
            jsonify({"message": "Logged out successfully"}),
            200,
        )
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@custom_jwt_required
def search_users():
    search_query = request.args.get("q", "")

    # Use SQLAlchemy's ilike for case-insensitive search on email and username
    users = User.query.filter(
        or_(
            User.email.ilike(f"%{search_query}%"),
            User.username.ilike(f"%{search_query}%"),
        )
    ).all()

    if users:
        user_list = [
            {
                "user_id": user.id,
                "email": user.email,
                "username": user.username,
                "role": {
                    "id": user.role.id,
                    "name": user.role.name,
                } if user.role else None,
            }
            for user in users
        ]
        response = {
            "status": "success",
            "status_code": 200,
            "users": user_list,
        }
    else:
        response = {
            "status": "error",
            "status_code": 404,
            "message": "No users found matching the search criteria",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def set_user_password_impl(user_id):
    data = request.get_json()
    new_password = data.get("password")

    response = {}

    try:
        user = User.query.get(user_id)

        if user is None:
            response["status"] = "error"
            response["status_code"] = 404
            response["message"] = "User not found"
            return jsonify(response), response["status_code"]

        if not user.is_first_time:
            response["status"] = "error"
            response["status_code"] = 400
            response["message"] = "Password has already been set"
            return jsonify(response), response["status_code"]

        # Update the password and is_first_time flag
        user.set_password(new_password)
        user.is_first_time = False

        db.session.commit()

        response["status"] = "success"
        response["status_code"] = 200
        response["message"] = "Password set successfully"
    except Exception as e:
        db.session.rollback()
        response["status"] = "error"
        response["status_code"] = 500
        response["message"] = f"An error occurred while setting the password: {str(e)}"

    return jsonify(response), response["status_code"]


def seed_data():
    try:
        User.create_seed_data()
        db.session.commit()
        return jsonify({'message': 'Users Data seeded successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error seeding data', 'error': str(e)}), 500
    finally:
        db.session.close()
