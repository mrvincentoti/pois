from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from ..redis_manager import custom_jwt_required
from ..rabbitmq_manager import publish_to_rabbitmq
from datetime import datetime
from .. import db
from .models import Permission
from ..util import decrypt, encrypt


def slugify(text):
    return text.replace(' ', '-').lower()


@custom_jwt_required
def add_permission():
    if request.method == "POST":
        data = request.get_json()
        permission_name = slugify(data.get("name"))
        permission_description = data.get("description")
        permission_group = slugify(data.get("group"))
        permission_module_id = data.get("module_id")

        if not permission_name or not permission_description or not permission_group or not permission_module_id:
            return jsonify({"message": "Name and description and Group and Module id are required"}), 400

        new_permission = Permission(
            name=permission_name, description=permission_description, group=permission_group, module_id=permission_module_id
        )

        try:
            db.session.add(new_permission)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "user_email": g.user["id"] if hasattr(g, "user") else None,
                "event": encrypt("add_role"),
                "auditable_id": new_permission.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {
                        "permission_name": permission_name,
                        "permission_description": permission_description,
                        "permission_group": permission_group,
                        "permission_module_id": permission_module_id
                    }
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Auth, Role, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)
            
            return jsonify({"message": "Permission added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding permission", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def list_permissions():
    try:
        # Get query parameters for pagination
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)

        # Get query parameters for pagination and search
        search_query = request.args.get("q", "")
        group_query = request.args.get("group", "")
        # Base query
        permissions_query = Permission.query

        # If search query is not empty
        if search_query:
            permissions_query = permissions_query.filter(
                or_(
                    Permission.name.ilike(f"%{search_query}%"),
                    Permission.description.ilike(f"%{search_query}%"),
                    Permission.group.ilike(f"%{search_query}%"),
                )
            )

        # If group query is not empty
        if group_query:
            permissions_query = permissions_query.filter(
                or_(Permission.group == group_query)
            )

        # Paginate the Permission query
        permissions_paginated = permissions_query.paginate(page=page, per_page=per_page)

        permission_list = []
        for permission in permissions_paginated.items:
            permission_data = {
                "id": permission.id,
                "name": permission.name,
                "description": permission.description,
                "group": permission.group,
                "module": {
                    "id": permission.module.id,
                    "name": permission.module.name,
                } if permission.module else None,
            }
            permission_list.append(permission_data)

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "user_email": g.user["id"] if hasattr(g, "user") else None,
            "event": encrypt("list_permission"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Auth, Permission, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response = {
            "status": "success",
            "status_code": 200,
            "permissions": permission_list,
            "total_pages": permissions_paginated.pages,
            "current_page": permissions_paginated.page,
            "total_items": permissions_paginated.total,
        }
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of permissions: {str(e)}",
        }

    return jsonify(response), response["status_code"]

@custom_jwt_required
def list_all_permissions():
    try:
       
        permissions_query = Permission.query.all()

        permission_list = []
        for permission in permissions_query:
            permission_data = {
                "id": permission.id,
                "name": permission.name,
                "description": permission.description,
                "group": permission.group,
                "module": {
                    "id": permission.module.id,
                    "name": permission.module.name,
                } if permission.module else None,
            }
            permission_list.append(permission_data)

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "user_email": g.user["id"] if hasattr(g, "user") else None,
            "event": encrypt("list_all_permissions"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Auth, Permission, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response = {
            "status": "success",
            "status_code": 200,
            "permissions": permission_list,
        }
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of permissions: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_permission(permission_id):
    permission = Permission.query.filter_by(id=permission_id, deleted_at=None).first()
    if permission:
        permission_data = {
            "id": permission.id,
            "name": permission.name,
            "description": permission.description,
            "group": permission.group,
            "module": {
                "id": permission.module.id,
                "name": permission.module.name,
            },
        }
        return jsonify({"permission": permission_data})
    else:
        return jsonify({"message": "Permission not found"}), 404


@custom_jwt_required
def edit_permission(permission_id):
    permission = Permission.query.filter_by(id=permission_id, deleted_at=None).first()

    if permission is None:
        return jsonify({"message": "Permission not found"}), 404

    data = request.get_json()
    permission_name = data.get("name")
    permission_description = data.get("description")

    if not permission_name or not permission_description:
        return jsonify({"message": "Name and description are required"}), 400

    permission.name = permission_name
    permission.description = permission_description

    try:
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "user_email": g.user["id"] if hasattr(g, "user") else None,
            "event": encrypt("add_permission"),
            "auditable_id": permission.id,
            "old_values": None,
            "new_values": encrypt(json.dumps(
                {
                    "permission_name": permission.name,
                    "permission_description": permission.description,
                    "permission_group": permission.group,
                    "permission_module_id": permission.module_id
                }
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Auth, Permission, Create"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        
        return jsonify({"message": "Permission updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating permission", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_permission(permission_id):
    permission = Permission.query.filter_by(id=permission_id, deleted_at=None).first()

    if permission is None:
        return jsonify({"message": "Permission not found"}), 404

    try:
        permission.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "user_email": g.user["id"] if hasattr(g, "user") else None,
            "event": encrypt("edit_permission"),
            "auditable_id": permission.id,
            "old_values": encrypt(json.dumps(
                {
                    "permission_name": permission.name,
                    "permission_description": permission.description,
                    "permission_group": permission.group,
                    "permission_module_id": permission.module_id
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Auth, Permission, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        
        return jsonify({"message": "Permission deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting permission", "error": str(e)}), 500
    finally:
        db.session.close()
