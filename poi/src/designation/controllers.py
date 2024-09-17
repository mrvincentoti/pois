import json
from datetime import datetime

from flask import request, jsonify, g
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_

from .. import db
from .models import Designation
from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import custom_jwt_required
from ..util import decrypt, encrypt


@custom_jwt_required
def add_designation():
    if request.method == "POST":
        data = request.get_json()
        designation_name = data.get("name")
        designation_description = data.get("description")

        designations = Designation.query.all()
        if not designation_name:
            return jsonify({"message": "Name is required"}), 400

        for designation in designations:
            # Decrypt each cadre's name
            decrypted_name = decrypt(designation.name)
            if decrypted_name == designation_name:
                return jsonify({"message": "A Designation with the same name already exists"}), 400

        new_designation = Designation(
            name=designation_name, description=designation_description
        )

        try:
            db.session.add(new_designation)
            db.session.commit()

            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("add_designation"),
                "auditable_id": new_designation.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"name": designation_name, "description": designation_description}
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Designation, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response_data = {
                "message": "Designation added successfully",
                "audit": audit_data,
            }
            return jsonify(response_data), 201
        except Exception as e:
            db.session.rollback()
            return (
                jsonify({"message": "Error adding designation", "error": str(e)}),
                500,
            )
        finally:
            db.session.close()


@custom_jwt_required
def get_designation(designation_id):
    designation = Designation.query.filter_by(
        id=designation_id, deleted_at=None
    ).first()
    if designation:
        designation_data = {
            "id": designation.id,
            "name": designation.name,
            "description": designation.description,
        }
        return jsonify({"designation": designation_data})
    else:
        return jsonify({"message": "Designation not found"}), 404


@custom_jwt_required
def edit_designation(designation_id):
    designation = Designation.query.filter_by(
        id=designation_id, deleted_at=None
    ).first()

    if designation is None:
        return jsonify({"message": "Designation not found"}), 404

    old_values = {
        "name": decrypt(designation.name),
        "description": decrypt(designation.description)
    }

    data = request.get_json()
    designation_name = data.get("name")
    designation_description = data.get("description")

    if not designation_name or not designation_description:
        return jsonify({"message": "Name and description are required"}), 400

    # Check if the updated designation name already exists
    existing_designation = Designation.query.filter(
        Designation.id != designation_id, Designation.name == designation_name
    ).first()
    if existing_designation:
        return (
            jsonify({"message": "A designation with the same name already exists"}),
            400,
        )

    designation.name = encrypt(designation_name)
    designation.description = encrypt(designation_description)

    try:
        designation.update(name=designation_name,description=designation_description)
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_designation"),
            "auditable_id": designation.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"name": decrypt(designation.name),
                 "description": decrypt(designation.description)}
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
            "message": "Designation updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating designation", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_designation(designation_id):
    designation = Designation.query.filter_by(
        id=designation_id, deleted_at=None
    ).first()

    if designation is None:
        return jsonify({"message": "Designation not found"}), 404

    try:
        designation.soft_delete()
        db.session.commit()

        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_designation"),
            "auditable_id": designation.id,
            "old_values": encrypt(json.dumps(
                {
                    "name": decrypt(designation.name),
                    "description": decrypt(designation.description)
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Designation, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({"message": "Designation deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting designation", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def list_designations():
    try:
        # Get query parameters for pagination
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)

        # Get query parameters for search
        search_query = request.args.get("q", "").lower()

        # Base query
        designations_query = Designation.query.filter_by(deleted_at=None)

        # Fetch all designations (to apply local decryption and filtering)
        all_designations = designations_query.all()

        # Decrypt and filter data locally
        designation_list = []
        search_pattern = search_query

        for designation in all_designations:
            designation_data = designation.to_dict()
            decrypted_name = designation_data['name'].lower()
            decrypted_description = designation_data['description'].lower()

            # Check if the designation matches the search term
            if search_pattern:
                if (
                    search_pattern in decrypted_name or
                    search_pattern in decrypted_description
                ):
                    designation_list.append(designation_data)
            else:
                designation_list.append(designation_data)

        # Calculate pagination manually after filtering
        total_items = len(designation_list)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_designations = designation_list[start:end]

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_designations"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Designations, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        # Prepare the response data
        response = {
            "status": "success",
            "status_code": 200,
            "designations": paginated_designations,
            "total_pages": (total_items + per_page - 1) // per_page,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        # Handle any database errors
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of designations: {str(e)}",
        }

    return jsonify(response), response["status_code"]



@custom_jwt_required
def list_all_designations():
    try:
        # Base query
        designations_query = Designation.query.filter_by(deleted_at=None).all()

        designation_list = []
        for designation in designations_query:
            designation_data = designation.to_dict()
            designation_list.append(designation_data)

        response = {
            "status": "success",
            "status_code": 200,
            "designations": designation_list,
        }
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of designations: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def restore_designation(designation_id):
    designation = Designation.query.filter_by(id=designation_id).first()

    if designation is None:
        return jsonify({"message": "Designation not found"}), 404

    try:
        designation.restore()
        db.session.commit()
        return jsonify({"message": "Designation restored successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring designation", "error": str(e)}), 500
    finally:
        db.session.close()
