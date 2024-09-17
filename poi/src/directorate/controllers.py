import json
from datetime import datetime

from flask import request, jsonify, g
import uuid
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import  custom_jwt_required
from sqlalchemy import or_
from ..util import decrypt


from .. import db
from .models import Directorate
from ..util import encrypt, decrypt


@custom_jwt_required
def add_directorate():
    if request.method == 'POST':
        data = request.get_json()
        directorate_name = data.get('name')
        directorate_description = data.get('description')
        
        if not directorate_name or not directorate_description:
            return jsonify({'message': 'Name and description are required'}), 400

        new_directorate = Directorate(name=directorate_name, description=directorate_description)

        try:
            db.session.add(new_directorate)
            db.session.commit()

            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "user") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("add_directorate"),
                "auditable_id": new_directorate.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"name": directorate_name, "description": directorate_description}
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Directorate, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response_data = {
                "message": "Directorate added successfully",
                "audit": audit_data,
            }
            return jsonify(response_data), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error adding directorate', 'error': str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_directorates():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)

        # Fetch all directorates that are not deleted
        directorate_query = Directorate.query.filter_by(deleted_at=None).all()

        # Initialize filtered directorates
        filtered_directorates = directorate_query

        # If a search term is provided, filter the records after decryption
        if search_term:
            search_pattern = search_term.lower()
            filtered_directorates = [
                directorate for directorate in directorate_query
                if search_pattern in decrypt(directorate.name).lower() or
                search_pattern in decrypt(directorate.description).lower()
            ]

        # Calculate pagination manually after filtering
        total_items = len(filtered_directorates)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_directorates = filtered_directorates[start:end]

        directorate_list = [directorate.to_dict()
                            for directorate in paginated_directorates]

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_directorates"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Directorate, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response = {
            "status": "success",
            "status_code": 200,
            "directorates": directorate_list,
            "total_pages": (total_items + per_page - 1) // per_page,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of directorates: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_directorate(directorate_id):
    directorate = Directorate.query.filter_by(id=directorate_id).first()
    if directorate:
        directorate_data = directorate.to_dict()
        return jsonify({'directorate': directorate_data})
    else:
        return jsonify({'message': 'Directorate not found'}), 404
    

@custom_jwt_required
def edit_directorate(directorate_id):
    directorate = Directorate.query.filter_by(
        id=directorate_id, deleted_at=None).first()

    if directorate is None:
        return jsonify({'message': 'Directorate not found'}), 404

    # Record the old values before updating, decrypting them first
    old_values = {
        "name": decrypt(directorate.name),
        "description": decrypt(directorate.description)
    }

    data = request.get_json()
    directorate_name = data.get('name')
    directorate_description = data.get('description')

    if not directorate_name or not directorate_description:
        return jsonify({'message': 'Name and description are required'}), 400

    try:
        # Use the update method to encrypt and save the new values
        directorate.update(name=directorate_name,
                           description=directorate_description)

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_directorate"),
            "auditable_id": directorate.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"name": directorate_name,
                 "description": directorate_description}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Directorate, Update"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Directorate updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating directorate', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_directorate(directorate_id):
    directorate = Directorate.query.filter_by(id=directorate_id).first()
    
    if directorate is None:
        return jsonify({'message': 'Directorate not found'}), 404

    try:
        directorate.soft_delete()
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
            "auditable_id": directorate.id,
            "old_values": encrypt(json.dumps(
                {
                    "name": decrypt(directorate.name),
                    "description": decrypt(directorate.description)
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Directorate, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({'message': 'Directorate deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting directorate', 'error': str(e)}), 500
    finally:
        db.session.close()
        
@custom_jwt_required
def restore_directorate(directorate_id):
    directorate = Directorate.query.filter_by(id=directorate_id).first()
    
    if directorate is None:
        return jsonify({'message': 'Directorate not found'}), 404

    try:
        directorate.restore()
        db.session.commit()
        return jsonify({'message': 'Directorate restored successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error restoring directorate', 'error': str(e)}), 500
    finally:
        db.session.close()