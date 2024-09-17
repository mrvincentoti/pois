from flask import request, jsonify, json, g
from sqlalchemy import func
from ..redis_manager import  custom_jwt_required
from ..rabbitmq_manager import publish_to_rabbitmq
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import Role
from sqlalchemy import or_
from ..util import decrypt, encrypt


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

@custom_jwt_required
def add_role():
    if request.method == 'POST':
        data = request.get_json()
        role_name = data.get('name')
        role_description = data.get('description')
        
        if not role_name or not role_description:
            return jsonify({'message': 'Name and description are required'}), 400

        # Check if the role name already exists (case-insensitive)
        existing_role = Role.query.filter(func.lower(Role.name) == func.lower(role_name)).first()
        if existing_role:
            return jsonify({'message': 'Role name already exists'}), 400

        new_role = Role(name=role_name, description=role_description)

        try:
            db.session.add(new_role)
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
                "auditable_id": new_role.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"role_name": role_name, "role_description": role_description}
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
            
            return jsonify({'message': 'Role added successfully'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error adding role', 'error': str(e)}), 500
        finally:
            db.session.close()

@custom_jwt_required
def get_role(role_id):
    role = Role.query.filter_by(id=role_id, deleted_at=None).first()
    if role:
        role_data = {
            'id': role.id,
            'name': role.name,
            'description': role.description,
            'permissions': parsePermissions(role.permissions)
        }
        return jsonify({'role': role_data})
    else:
        return jsonify({'message': 'Role not found'}), 404
    
@custom_jwt_required
def edit_role(role_id):
    role = Role.query.filter_by(id=role_id, deleted_at=None).first()

    if role is None:
        return jsonify({'message': 'Role not found'}), 404

    data = request.get_json()
    role_name = data.get('name')
    role_description = data.get('description')

    if not role_name or not role_description:
        return jsonify({'message': 'Name and description are required'}), 400

    # Check if the role name already exists (case-insensitive)
    existing_role = Role.query.filter(
        func.lower(Role.name) == func.lower(role_name),
        Role.id != role_id  # Exclude the current role from the check
    ).first()

    if existing_role:
        return jsonify({'message': 'Role name already exists'}), 400

    role.name = role_name
    role.description = role_description

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
            "event": encrypt("edit_role"),
            "auditable_id": role.id,
            "old_values": encrypt(json.dumps({
                "name": role.name,
                "description": role.description,
            })),
            "new_values": encrypt(json.dumps(
                {"role_name": role.name, "role_description": role.description}
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
        
        return jsonify({'message': 'Role updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating role', 'error': str(e)}), 500
    finally:
        db.session.close()

@custom_jwt_required
def delete_role(role_id):
    role = Role.query.filter_by(id=role_id, deleted_at=None).first()
    
    if role is None:
        return jsonify({'message': 'Role not found'}), 404

    try:
        role.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "user_email": g.user["id"] if hasattr(g, "user") else None,
            "event": encrypt("delete_role"),
            "auditable_id": role.id,
            "old_values": encrypt(json.dumps({
                "name": decrypt(role.name),
                "description": decrypt(role.description),
            })),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Auth, Role, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        
        return jsonify({'message': 'Role deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting role', 'error': str(e)}), 500
    finally:
        db.session.close()

@custom_jwt_required
def list_roles():
    try:
        # Get query parameters for pagination
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)

        # Get query parameters for pagination and search
        search_query = request.args.get('q', '')

        # Base query
        roles_query = Role.query.filter_by(deleted_at=None)

        # If search query is not empty
        if search_query:
            roles_query = roles_query.filter(
                or_(
                    Role.name.ilike(f"%{search_query}%"),
                    Role.description.ilike(f"%{search_query}%"),
                )
            )

        # Paginate the Role query
        roles_paginated = roles_query.paginate(page=page, per_page=per_page)

        role_list = []
        for role in roles_paginated.items:
            role_data = {
                "id": role.id,
                "name": role.name,
                "description": role.description,
                "permissions": parsePermissions(role.permissions),
                "deleted_at": role.deleted_at
            }
            role_list.append(role_data)

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "user_email": g.user["id"] if hasattr(g, "user") else None,
            "event": encrypt("list_role"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Auth, Role, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response = {
            "status": "success",
            "status_code": 200,
            "roles": role_list,
            "total_pages": roles_paginated.pages,
            "current_page": roles_paginated.page,
            "total_items": roles_paginated.total,
        }
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of roles: {str(e)}",
        }

    return jsonify(response), response["status_code"]

def seed_data():
    try:
        Role.create_seed_data()
        db.session.commit()
        return jsonify({'message': 'Roles Data seeded successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error seeding data', 'error': str(e)}), 500
    finally:
        db.session.close()