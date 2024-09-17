from datetime import datetime

from flask import request, jsonify, json, g
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_

from .. import db
from .models import Sanction
from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import custom_jwt_required
from ..util import decrypt, encrypt


@custom_jwt_required
def add_sanction():
    if request.method == 'POST':
        data = request.get_json()
        sanction_name = data.get('name')
        sanction_description = data.get('description')

        if not sanction_name or not sanction_description:
            return jsonify({'message': 'Name and description are required'}), 400

        new_sanction = Sanction(name=sanction_name, description=sanction_description)

        try:
            db.session.add(new_sanction)
            db.session.commit()

            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "event": encrypt("add_sanction"),
                "auditable_id": new_sanction.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"name": sanction_name, "description": sanction_description}
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Sanction, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response_data = {
                "message": "Sanction added successfully",
                "audit": audit_data,
            }
            return jsonify(response_data), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error adding sanction', 'error': str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_sanction(sanction_id):
    sanction = Sanction.query.filter_by(id=sanction_id, deleted_at=None).first()
    if sanction:
        sanction_data = sanction.to_dict()
        return jsonify({'sanction': sanction_data})
    else:
        return jsonify({'message': 'Sanction not found'}), 404


@custom_jwt_required
def edit_sanction(sanction_id):
    sanction = Sanction.query.filter_by(id=sanction_id, deleted_at=None).first()

    if sanction is None:
        return jsonify({'message': 'Sanction not found'}), 404

        # Record the old values before updating
    old_values = {
        "name": decrypt(sanction.name),
        "description": decrypt(sanction.description)
    }
    data = request.get_json()
    sanction_name = data.get('name')
    sanction_description = data.get('description')

    if not sanction_name or not sanction_description:
        return jsonify({'message': 'Name and description are required'}), 400

    try:
        sanction.update(name=sanction_name, description=sanction_description)
        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_sanction"),
            "auditable_id": sanction.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"id": sanction.id, "name": decrypt(sanction.name), "description": decrypt(sanction.description)}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Sanction, Update"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Sanction updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating sanction', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_sanction(sanction_id):
    sanction = Sanction.query.filter_by(id=sanction_id, deleted_at=None).first()

    if sanction is None:
        return jsonify({'message': 'Sanction not found'}), 404

    try:

        sanction.soft_delete()
        db.session.commit()

        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_sanction"),
            "auditable_id": sanction.id,
            "old_values": encrypt(json.dumps(
                {
                    "id": sanction.id,
                    "name": decrypt(sanction.name),
                    "description": decrypt(sanction.description)
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Sanction, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({'message': 'Sanction deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting sanction', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def list_sanctions():
    try:
        # Get query parameters for pagination
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_query = request.args.get('q', default='', type=str)

        # Build the base query for non-deleted sanctions
        sanctions_query = Sanction.query.filter_by(deleted_at=None)

        # Paginate the Sanction query
        sanctions_paginated = sanctions_query.paginate(
            page=page, per_page=per_page)

        # Decrypt and filter data locally
        search_pattern = search_query.lower() if search_query else None
        sanction_list = []

        for sanction in sanctions_paginated.items:
            # Decrypt the sanction data
            decrypted_name = decrypt(sanction.name).lower()
            decrypted_description = decrypt(sanction.description).lower()

            # Apply local filtering
            if search_pattern:
                if (
                        search_pattern in decrypted_name or
                        search_pattern in decrypted_description
                ):
                    sanction_data = {
                        'id': sanction.id,
                        'name': decrypted_name,
                        'description': decrypted_description
                    }
                    sanction_list.append(sanction_data)
            else:
                sanction_data = {
                    'id': sanction.id,
                    'name': decrypted_name,
                    'description': decrypted_description
                }
                sanction_list.append(sanction_data)

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_sanctions"),
            "auditable_id": None,
            "old_values": None,
            "url": encrypt(request.url),
            "new_values": None,
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Sanction, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        # Prepare the response
        response = {
            "status": "success",
            "status_code": 200,
            "sanctions": sanction_list,
            "total_pages": sanctions_paginated.pages,
            "current_page": sanctions_paginated.page,
            "total_items": len(sanction_list),
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of sanctions: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def restore_sanction(sanction_id):
    sanction = Sanction.query.filter_by(id=sanction_id).first()

    if sanction is None:
        return jsonify({'message': 'Sanction not found'}), 404

    try:
        sanction.restore()
        db.session.commit()
        return jsonify({'message': 'Sanction restored successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error restoring sanction', 'error': str(e)}), 500
    finally:
        db.session.close()
