from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import Permission
from ..util import custom_jwt_required, save_audit_data


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
        method = data.get("method")
        route_path = data.get("route_path")
        
        if not permission_name or not permission_description or not permission_group or not permission_module_id:
            return jsonify({"message": "Name and description and Group and Module id are required"}), 400

        new_permission = Permission(
            name=permission_name, description=permission_description, group=permission_group, module_id=permission_module_id, route_path=route_path, method=method
        )

        try:
            db.session.add(new_permission)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_permission",
                "auditable_id": new_permission.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "permission_name": permission_name,
                        "permission_description": permission_description,
                        "permission_group": permission_group,
                        "permission_module_id": permission_module_id,
                        "route_path":route_path,
                        "method":method
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Permission, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
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

        # Get query parameters for search and filtering
        search_query = request.args.get("q", "")
        group_query = request.args.get("group", "")
        
        # Base query with sorting in descending order
        permissions_query = Permission.query.order_by(Permission.id.desc())

        # If search query is not empty, apply filtering
        if search_query:
            permissions_query = permissions_query.filter(
                or_(
                    Permission.name.ilike(f"%{search_query}%"),
                    Permission.description.ilike(f"%{search_query}%"),
                    Permission.group.ilike(f"%{search_query}%"),
                    Permission.method.ilike(f"%{search_query}%"),
                    Permission.route_path.ilike(f"%{search_query}%")
                )
            )

        # If group query is not empty, apply filtering
        if group_query:
            permissions_query = permissions_query.filter(
                Permission.group == group_query
            )

        # Paginate the permissions query
        permissions_paginated = permissions_query.paginate(page=page, per_page=per_page)

        # Prepare the permissions list
        permission_list = []
        for permission in permissions_paginated.items:
            permission_data = {
                "id": permission.id,
                "name": permission.name,
                "description": permission.description,
                "group": permission.group,
                "method": permission.method,
                "route_path": permission.route_path,
                "module": {
                    "id": permission.module.id,
                    "name": permission.module.name,
                } if permission.module else None,
            }
            permission_list.append(permission_data)

        # Audit logging
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "list_permission",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Auth, Permission, List",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        # Response with pagination info
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
        # Pagination parameters from request args
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        # Query for permissions, order by descending id, and paginate
        permissions_query = Permission.query.order_by(Permission.id.desc()).paginate(page=page, per_page=per_page, error_out=False)

        # Process permissions
        permission_list = []
        for permission in permissions_query.items:
            permission_data = {
                "id": permission.id,
                "name": permission.name,
                "description": permission.description,
                "group": permission.group,
                "method": permission.method,
                "route_path": permission.route_path,
                "module": {
                    "id": permission.module.id,
                    "name": permission.module.name,
                } if permission.module else None,
            }
            permission_list.append(permission_data)

        # Audit logging
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "list_all_permissions",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Auth, Permission, List",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        # Response with pagination info
        response = {
            "status": "success",
            "status_code": 200,
            "permissions": permission_list,
            "pagination": {
                "total": permissions_query.total,
                "pages": permissions_query.pages,
                "current_page": permissions_query.page,
                "per_page": permissions_query.per_page,
            }
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
            "method": permission.method,
            "route_path": permission.route_path,
            "module": {
                "id": permission.module.id,
                "name": permission.module.name,
            },
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_permission",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Auth, Permission, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

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
    method = data.get("method")
    route_path = data.get("route_path")

    if not permission_name or not permission_description:
        return jsonify({"message": "Name and description are required"}), 400

    permission.name = permission_name
    permission.description = permission_description
    permission.method = method
    permission.route_path = route_path

    try:
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"edit_permission",
                "auditable_id": permission.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "permission_name": permission_name,
                        "permission_description": permission_description,
                        "permission_group": permission.group,
                        "permission_module_id": permission.module_id,
                        "method": permission.method,
                        "route_path": permission.route_path
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Permission, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
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
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"delete_permission",
                "auditable_id": permission.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "permission_name": permission.name,
                        "permission_description": permission.description,
                        "permission_group": permission.group,
                        "permission_module_id": permission.module_id,
                        "method": permission.method,
                        "route_path": permission.route_path
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Permission, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Permission deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting permission", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_permission(permission_id):
    permission = Permission.query.filter_by(id=permission_id).first()

    if permission is None:
        return jsonify({"message": "Permission not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_permission",
            "auditable_id": permission.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": permission.name,
                    "description": permission.description,
                    "method": permission.method,
                    "route_path": permission.route_path
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Setup, Permission, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        permission.restore()
        db.session.commit()
        return (
            jsonify({"message": "Permission restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring permission", "error": str(e)}), 500
    finally:
        db.session.close()