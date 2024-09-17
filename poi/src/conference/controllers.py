import json
from datetime import datetime

from flask import request, jsonify, g
import uuid

from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError

from .. import db
from .models import Conference
from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import custom_jwt_required
from ..util import decrypt,encrypt

@custom_jwt_required
def add_conference():
    if request.method == 'POST':
        data = request.get_json()
        conference_name = data.get('name')
        conference_description = data.get('description')

        if not conference_name or not conference_description:
            return jsonify({'message': 'Name and description are required'}), 400

        new_conference = Conference(name=conference_name, description=conference_description)

        try:
            db.session.add(new_conference)
            db.session.commit()

            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("add_conference"),
                "auditable_id": new_conference.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"name": conference_name, "description": conference_description}
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Conference, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response_data = {
                "message": "Conference added successfully",
                "audit": audit_data,
            }
            return jsonify(response_data), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error adding conference', 'error': str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_conferences():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)

        # Build the query to get non-deleted conferences
        conference_query = Conference.query.filter_by(deleted_at=None)

        # Paginate the results
        conferences = conference_query.paginate(page=page, per_page=per_page)

        # Decrypt and filter data locally
        search_pattern = search_term.lower() if search_term else None
        conference_list = []

        for conference in conferences.items:
            # Decrypt the conference data
            decrypted_name = decrypt(conference.name).lower()
            decrypted_description = decrypt(conference.description).lower()

            # Apply local filtering
            if search_pattern:
                if (
                    search_pattern in decrypted_name or
                    search_pattern in decrypted_description
                ):
                    conference_data = {
                        'id': conference.id,
                        'name': decrypted_name,
                        'description': decrypted_description,
                        'deleted_at': conference.deleted_at
                    }
                    conference_list.append(conference_data)
            else:
                conference_data = {
                    'id': conference.id,
                    'name': decrypted_name,
                    'description': decrypted_description,
                    'deleted_at': conference.deleted_at
                }
                conference_list.append(conference_data)

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_conference"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Conference, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        # Prepare the response
        response = {
            "status": "success",
            "status_code": 200,
            "conferences": conference_list,
            "total_pages": conferences.pages,
            "current_page": conferences.page,
            "total_items": len(conference_list),
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of conferences: {str(e)}",
        }

    return jsonify(response), response["status_code"]

@custom_jwt_required
def get_conference(conference_id):
    conference = Conference.query.filter_by(id=conference_id, deleted_at=None).first()
    if conference:
        conference_data = conference.to_dict()
        return jsonify({'conference': conference_data})
    else:
        return jsonify({'message': 'Conference not found'}), 404


@custom_jwt_required
def edit_conference(conference_id):
    conference = Conference.query.filter_by(id=conference_id, deleted_at=None).first()

    if conference is None:
        return jsonify({'message': 'Conference not found'}), 404

    old_values = {
        "name": decrypt(conference.name),
        "description": decrypt(conference.description)
    }

    data = request.get_json()
    conference_name = data.get('name')
    conference_description = data.get('description')

    if not conference_name or not conference_description:
        return jsonify({'message': 'Name and description are required'}), 400

    try:
        conference.update(name=conference_name,description=conference_description)

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_conference"),
            "auditable_id": conference.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"name": decrypt(conference.name),
                 "description": decrypt(conference.description)}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Conference, Update"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Conference updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating conference', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_conference(conference_id):
    conference = Conference.query.filter_by(id=conference_id, deleted_at=None).first()

    if conference is None:
        return jsonify({'message': 'Conference not found'}), 404

    try:
        conference.soft_delete()
        db.session.commit()

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_conference"),
            "auditable_id": conference.id,
            "old_values": encrypt(json.dumps(
                {
                    "name": decrypt(conference.name),
                    "description": decrypt(conference.description)
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Conference, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({"message": "Conference deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting Conference', 'error': str(e)}), 500
    finally:
        db.session.close()

@custom_jwt_required
def search_conferences():
    search_query = request.args.get("q", "")

    # Use SQLAlchemy's ilike for case-insensitive search on email and username
    conferences = Conference.query.filter(
        or_(
            Conference.name.ilike(f"%{search_query}%"),
            Conference.description.ilike(f"%{search_query}%"),
        )
    ).all()

    if conferences:
        conference_list = [
            {
                "id": conference.id,
                "name": conference.name,
                "description": conference.description,
                "deleted_at": conference.deleted_at,
            }
            for conference in conferences
        ]
        response = {
            "status": "success",
            "status_code": 200,
            "users": conference_list,
        }
    else:
        response = {
            "status": "error",
            "status_code": 404,
            "message": "No conference found matching the search criteria",
        }

    return jsonify(response), response["status_code"]