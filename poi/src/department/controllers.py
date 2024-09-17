import json
from datetime import datetime

from flask import request, jsonify, g
import uuid
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import custom_jwt_required
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from ..util import decrypt

from .. import db
from .models import Department
from ..util import encrypt


@custom_jwt_required
def add_department():
    if request.method == 'POST':
        data = request.get_json()
        department_name = data.get('name')
        department_description = data.get('description')
        directorate_id = data.get('directorate_id')

        if not department_name or not department_description or not directorate_id:
            return jsonify({'message': 'Name, Directorate and description are required'}), 400

        new_department = Department(name=department_name, description=department_description,
                                    directorate_id=directorate_id)

        try:
            db.session.add(new_department)
            db.session.commit()

            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("add_department"),
                "auditable_id": new_department.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"name": department_name, "description": department_description,
                     "directorate_id": directorate_id}
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Department, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response_data = {
                "message": "Department added successfully",
                "audit": audit_data,
            }
            return jsonify(response_data), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error adding department', 'error': str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_departments():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)
        directorate_id = request.args.get(
            'directorate_id', default=None, type=str)

        # Fetch all departments that are not deleted
        department_query = Department.query.filter_by(deleted_at=None)

        # Filter by directorate_id if provided
        if directorate_id:
            department_query = department_query.filter_by(
                directorate_id=directorate_id)

        # Eager load the directorate
        department_query = department_query.options(
            joinedload(Department.directorate))

        # Fetch all matching departments
        departments = department_query.all()

        # Decrypt and filter data locally
        department_list = []
        search_pattern = search_term.lower() if search_term else None

        for department in departments:
            department_data = department.to_dict()
            decrypted_name = department_data['name'].lower()
            decrypted_description = department_data['description'].lower()

            # Decrypt directorate data if it exists
            directorate_data = department_data.get('directorate')
            decrypted_directorate_name = directorate_data['name'].lower(
            ) if directorate_data else None
            decrypted_directorate_description = directorate_data['description'].lower(
            ) if directorate_data else None

            # Check if the department or directorate matches the search term
            if search_pattern:
                if (
                        search_pattern in decrypted_name or
                        search_pattern in decrypted_description or
                        (directorate_data and (
                                search_pattern in decrypted_directorate_name or
                                search_pattern in decrypted_directorate_description
                        ))
                ):
                    department_list.append(department_data)
            else:
                department_list.append(department_data)

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_departments"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Department, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        # Calculate pagination manually after filtering
        total_items = len(department_list)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_departments = department_list[start:end]

        # Prepare response
        response = {
            "status": "success",
            "status_code": 200,
            "departments": paginated_departments,
            "total_pages": (total_items + per_page - 1) // per_page,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of departments: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_department(department_id):
    department = Department.query.filter_by(id=department_id).options(
        joinedload(Department.directorate)
    ).first()

    if department:
        department_data = department.to_dict()
        return jsonify({'department': department_data})
    else:
        return jsonify({'message': 'Department not found'}), 404


@custom_jwt_required
def edit_department(department_id):
    department = Department.query.filter_by(id=department_id, deleted_at=None).first()

    if department is None:
        return jsonify({'message': 'Department not found'}), 404
    old_values = {
        "id": decrypt(department.id),
        "name": decrypt(department.name),
        "description": decrypt(department.description),
        "directorate_id": department.directorate_id
    }

    data = request.get_json()
    department_name = data.get('name')
    department_description = data.get('description')
    directorate_id = data.get('directorate_id')

    if not department_name or not department_description or not directorate_id:
        return jsonify({'message': 'Name, directorate_id and description are required'}), 400

    try:
        # Use the update method to encrypt and save the new values
        department.update(name=department_name,
                          description=department_description, directorate_id=directorate_id)
        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_department"),
            "auditable_id": department.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"name": department_name,
                 "description": department_description,
                 "directorate_id": directorate_id}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Department, Update"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Department updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating department', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_department(department_id):
    department = Department.query.filter_by(id=department_id).first()

    if department is None:
        return jsonify({'message': 'Department not found'}), 404

    try:
        department.soft_delete()
        db.session.commit()

        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_directorate"),
            "auditable_id": department.id,
            "old_values": encrypt(json.dumps(
                {
                    "name": decrypt(department.name),
                    "description": decrypt(department.description),
                    "directorate_id": department.directorate_id
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Department, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({'message': 'Department deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting department', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_department(department_id):
    department = Department.query.filter_by(id=department_id).first()

    if department is None:
        return jsonify({'message': 'Department not found'}), 404

    try:
        department.restore()
        db.session.commit()
        return jsonify({'message': 'Department restored successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error restoring department', 'error': str(e)}), 500
    finally:
        db.session.close()
