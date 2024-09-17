from flask import request, jsonify, json, g
import uuid
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from ..redis_manager import custom_jwt_required
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from datetime import datetime
import pika
from ..rabbitmq_manager import publish_to_rabbitmq
from ..util import decrypt, encrypt

import logging

from .. import db
from .models import Training
from ..util import encrypt


@custom_jwt_required
def add_training():
    if request.method == "POST":
        data = request.get_json()
        training_name = data.get("name")
        training_description = data.get("description")

        if not training_name or not training_description:
            return jsonify({"message": "Name and description are required"}), 400

        new_training = Training(name=training_name, description=training_description)

        try:
            db.session.add(new_training)
            db.session.commit()
            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "user_email": g.user["id"] if hasattr(g, "user") else None,
                "event": encrypt("add_training"),
                "auditable_id": new_training.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"name": training_name, "description": training_description}
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Training, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)
            
            response_data = {
                "message": "Training added successfully",
                "audit": audit_data,
            }
            return jsonify(response_data), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding training", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_trainings():
    try:
        # Get query parameters for pagination
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)
        search_term = request.args.get("q", default=None, type=str)

        # Base query
        training_query = Training.query.filter_by(deleted_at=None)

        # Fetch all trainings for local decryption and filtering
        all_trainings = training_query.all()

        # Decrypt and filter data locally
        training_list = []
        search_pattern = search_term.lower() if search_term else None

        for training in all_trainings:
            training_data = training.to_dict()
            decrypted_name = training_data["name"].lower()
            decrypted_description = training_data["description"].lower()

            # Check if the training matches the search term
            if search_pattern:
                if (
                    search_pattern in decrypted_name or
                    search_pattern in decrypted_description
                ):
                    training_list.append(training_data)
            else:
                training_list.append(training_data)

        # Calculate pagination manually after filtering
        total_items = len(training_list)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_trainings = training_list[start:end]

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_trainings"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Training, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        # Prepare the response data
        response = {
            "status": "success",
            "status_code": 200,
            "trainings": paginated_trainings,
            "total_pages": (total_items + per_page - 1) // per_page,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        # Handle any database errors
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of trainings: {str(e)}",
        }

    return jsonify(response), response["status_code"]




@custom_jwt_required
def get_training(training_id):
    training = Training.query.filter_by(id=training_id).first()

    if training:
        training_data = training.to_dict()
        return jsonify({"training": training_data})
    else:
        return jsonify({"message": "Training not found"}), 404


@custom_jwt_required
def edit_training(training_id):
    training = Training.query.filter_by(id=training_id, deleted_at=None).first()

    if training is None:
        return jsonify({"message": "Training not found"}), 404

    data = request.get_json()
    new_training_name = data.get("name")
    new_training_description = data.get("description")

    if not new_training_name or not new_training_description:
        return jsonify({"message": "Name, and description are required"}), 400

    # Record the old values before updating
    old_values = {
        "name": decrypt(training.name),
        "description": decrypt(training.description),
    }

    # Update the training
    training.name = encrypt(new_training_name)
    training.description = encrypt(new_training_description)

    try:
        db.session.commit()
        training.update(name=new_training_name, description=new_training_description)
        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_training"),
            "auditable_id": training.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"name": decrypt(training.name), "description": decrypt(training.description)}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Training, Update"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        response_data = {
            "message": "Training updated successfully",
            "audit": audit_data,
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating training", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_training(training_id):
    training = Training.query.filter_by(id=training_id).first()

    if training is None:
        return jsonify({"message": "Training not found"}), 404

    try:

        db.session.delete(training)
        db.session.commit()
        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_training"),
            "auditable_id": training.id,
            "old_values": encrypt(json.dumps(
                {
                    "name": decrypt(training.name),
                    "description": decrypt(training.description),
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Training, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return (
            jsonify({"message": "Training deleted successfully", "audit": audit_data}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting training", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_training(training_id):
    training = Training.query.filter_by(id=training_id).first()

    if training is None:
        return jsonify({"message": "Training not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": "restore_training",
            "auditable_id": training.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": training.name,
                    "description": training.description,
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Setup, Training, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        training.restore()
        db.session.commit()
        return (
            jsonify({"message": "Training restored successfully", "audit": audit_data}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring training", "error": str(e)}), 500
    finally:
        db.session.close()




