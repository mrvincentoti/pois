import json
from datetime import datetime

from flask import request, jsonify, g
from sqlalchemy.exc import SQLAlchemyError
from .. import db
from .models import Cadre
from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import custom_jwt_required
from sqlalchemy import or_
from ..util import decrypt

from ..util import encrypt, decrypt


@custom_jwt_required
def add_cadre():
    try:
        data = request.get_json()
        name = data.get("name")

        cadres = Cadre.query.all()
        if not name:
            return jsonify({"message": "Name is required"}), 400

        for cadre in cadres:
            # Decrypt each cadre's name
            decrypted_name = decrypt(cadre.name)
            if decrypted_name == name:
                return jsonify({"message": "A cadre with the same name already exists"}), 400

        new_cadre = Cadre(name=name)
        db.session.add(new_cadre)
        db.session.commit()

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("add_cadre"),
            "auditable_id": new_cadre.id,
            "old_values": None,
            "new_values": encrypt(json.dumps(
                {"name": name}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Cadre, Create"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Cadre added successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Error adding cadre", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def list_cadres():
    try:
        # Get query parameters for pagination
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)
        search_term = request.args.get("q", default="", type=str)

        # Fetch all cadres that are not deleted
        cadre_query = Cadre.query.filter_by(deleted_at=None).all()

        # Decrypt and filter data locally
        cadre_list = []
        search_pattern = search_term.lower() if search_term else None

        for cadre in cadre_query:
            cadre_data = cadre.to_dict()
            decrypted_name = cadre_data['name'].lower()

            # Check if the cadre matches the search term
            if search_pattern:
                if search_pattern in decrypted_name:
                    cadre_list.append(cadre_data)
            else:
                cadre_list.append(cadre_data)

        # Calculate pagination manually after filtering
        total_items = len(cadre_list)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_cadres = cadre_list[start:end]

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_cadres"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Cadre, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        # Prepare response
        response = {
            "status": "success",
            "status_code": 200,
            "cadres": paginated_cadres,
            "total_pages": (total_items + per_page - 1) // per_page,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of cadres: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_cadre(cadre_id):
    cadre = Cadre.query.filter_by(id=cadre_id, deleted_at=None).first()
    if cadre:
        cadre_data = cadre.to_dict()
        return jsonify({"cadre": cadre_data})
    else:
        return jsonify({"message": "Cadre not found"}), 404


@custom_jwt_required
def update_cadre(cadre_id):
    try:
        cadre = Cadre.query.filter_by(id=cadre_id, deleted_at=None).first()

        if not cadre:
            return jsonify({"message": "Cadre not found"}), 404

        old_values = {
            "name": decrypt(cadre.name)
        }

        data = request.get_json()

        # Check if the new name is provided
        new_name = data.get("name")
        if new_name:
            cadres = Cadre.query.filter(Cadre.id != cadre_id).all()

            for cadre in cadres:
                # Decrypt each cadre's name
                decrypted_name = decrypt(cadre.name)
                if decrypted_name == new_name:
                    return jsonify({"message": "A cadre with the same name already exists"}), 400

            # Encrypt the new name
            encrypted_new_name = encrypt(new_name)

            # Retrieve the current cadre by id
            cadre = Cadre.query.get(cadre_id)
            if not cadre:
                return jsonify({"message": "Cadre not found"}), 404

            # Update the cadre's name with the new encrypted name
            cadre.name = encrypted_new_name

        db.session.commit()

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_cadre"),
            "auditable_id": cadre.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"name": decrypt(cadre.name)}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Cadre, Update"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Cadre updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Error updating cadre", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_cadre(cadre_id):
    try:
        cadre = Cadre.query.filter_by(id=cadre_id, deleted_at=None).first()

        if not cadre:
            return jsonify({"message": "Cadre not found"}), 404

        cadre.soft_delete()
        db.session.commit()

        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_cadre"),
            "auditable_id": cadre.id,
            "old_values": encrypt(json.dumps(
                {
                    "name": decrypt(cadre.name)
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Cadre, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        return jsonify({"message": "Cadre deleted successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return (
            jsonify({"message": "Error deleting cadre", "error": str(e)}),
            500,
        )
    finally:
        db.session.close()


@custom_jwt_required
def restore_cadre(cadre_id):
    cadre = Cadre.query.filter_by(id=cadre_id).first()

    if not cadre:
        return jsonify({"message": "Cadre not found"}), 404

    try:
        cadre.restore()
        db.session.commit()
        return jsonify({"message": "Cadre restored successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return (
            jsonify({"message": "Error restoring cadre", "error": str(e)}),
            500,
        )
    finally:
        db.session.close()
