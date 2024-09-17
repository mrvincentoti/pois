from datetime import datetime

from flask import request, jsonify, json, g
import uuid

from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError

from .. import db
from .models import Unit
from ..department.models import Department
from ..redis_manager import custom_jwt_required
from ..rabbitmq_manager import publish_to_rabbitmq
from ..util import decrypt, encrypt


@custom_jwt_required
def add_unit():
    if request.method == 'POST':
        data = request.get_json()
        unit_name = data.get('name')
        unit_description = data.get('description')
        department_id = data.get('department_id')

        if not unit_name or not unit_description or not department_id:
            return jsonify({'message': 'Name , description and department id are required'}), 400

        new_unit = Unit(name=unit_name, description=unit_description, department_id=department_id)

        try:
            db.session.add(new_unit)
            db.session.commit()

            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("add_unit"),
                "auditable_id": new_unit.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"name": unit_name, "description": unit_description, "department": department_id}
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Unit, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response_data = {
                "message": "Unit added successfully",
                "audit": audit_data,
            }
            return jsonify(response_data), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error adding unit', 'error': str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_units():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)
        department_id = request.args.get(
            'department_id', default=None, type=str)

        # Build the query
        unit_query = Unit.query.filter_by(deleted_at=None)

        if department_id:
            unit_query = unit_query.filter_by(department_id=department_id)

        # Fetch all units (to apply local decryption and filtering)
        all_units = unit_query.all()

        # Decrypt and filter data locally
        unit_list = []
        search_pattern = search_term.lower() if search_term else None

        for unit in all_units:
            unit_data = unit.to_dict()
            decrypted_name = unit_data['name'].lower()
            decrypted_description = unit_data['description'].lower()

            # Check if the unit matches the search term
            if search_pattern:
                if (
                        search_pattern in decrypted_name or
                        search_pattern in decrypted_description
                ):
                    unit_list.append(unit_data)
            else:
                unit_list.append(unit_data)

        # Calculate pagination manually after filtering
        total_items = len(unit_list)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_units = unit_list[start:end]

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_units"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Unit, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        # Prepare response
        response = {
            "status": "success",
            "status_code": 200,
            "units": paginated_units,
            "total_pages": (total_items + per_page - 1) // per_page,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of units: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_unit(unit_id):
    unit = Unit.query.filter_by(id=unit_id, deleted_at=None).first()
    if unit:
        unit_data = {
            'id': unit.id,
            'name': unit.name,
            'description': unit.description,
            'department': {
                'id': unit.department.id,
                'name': unit.department.name,
                'description': unit.department.description
            }
        }
        return jsonify({'unit': unit_data})
    else:
        return jsonify({'message': 'Unit not found'}), 404


@custom_jwt_required
def edit_unit(unit_id):
    unit = Unit.query.filter_by(id=unit_id, deleted_at=None).first()
    if unit is None:
        return jsonify({'message': 'Unit not found'}), 404

    # Record the old values before updating
    old_values = {
        "name": decrypt(unit.name),
        "description": decrypt(unit.description),
        "department_id": decrypt(unit.department_id)
    }

    data = request.get_json()
    new_unit_name = data.get('name')
    new_unit_description = data.get('description')
    new_department_id = data.get('department_id')

    if not new_unit_name or not new_unit_description or not new_department_id:
        return jsonify({'message': 'Name , description and department id are required'}), 400

    department = Department.query.filter_by(id=new_department_id).first()

    if department is None:
        return jsonify({'message': 'Department not found'}), 404

    try:
        unit.update(name=new_unit_name,
                    description=new_unit_description, department_id=new_department_id)
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_unit"),
            "auditable_id": unit.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"name": new_unit_name, "description": new_unit_description, "department": new_department_id}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Unit, Update"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        response_data = {
            "message": "Unit updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating unit', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_unit(unit_id):
    unit = Unit.query.filter_by(id=unit_id, deleted_at=None).first()

    if unit is None:
        return jsonify({'message': 'Unit not found'}), 404

    try:
        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_unit"),
            "auditable_id": unit.id,
            "old_values": encrypt(json.dumps(
                {
                    "name": decrypt(unit.name),
                    "description": decrypt(unit.description),
                    "department": unit.department_id,
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Unit, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        unit.soft_delete()
        db.session.commit()
        return (
            jsonify({"message": "Unit deleted successfully", "audit": audit_data}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting Unit', 'error': str(e)}), 500
    finally:
        db.session.close()
