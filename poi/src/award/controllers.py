import json
from datetime import datetime

from flask import request, jsonify, g
import uuid
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError

from .. import db
from .models import Award
from ..conference.models import Conference
from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import  custom_jwt_required
from ..util import decrypt, encrypt


@custom_jwt_required
def add_award():
    if request.method == 'POST':
        data = request.get_json()
        award_name = data.get('name')
        award_description = data.get('description')

        if not award_name or not award_description:
            return jsonify({'message': 'Name and description are required'}), 400

        new_award = Award(name=award_name, description=award_description)

        try:
            db.session.add(new_award)
            db.session.commit()

            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("add_award"),
                "auditable_id": new_award.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"name": award_name, "description": award_description}
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Award, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response_data = {
                "message": "Award added successfully",
                "audit": audit_data,
            }
            return jsonify(response_data), 201


        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error adding award', 'error': str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_awards():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)

        # Base query for non-deleted awards
        award_query = Award.query.filter_by(deleted_at=None)

        # Fetch all awards
        all_awards = award_query.all()

        # Decrypt and filter data locally
        award_list = []
        search_pattern = search_term.lower() if search_term else None

        for award in all_awards:
            award_data = award.to_dict()
            decrypted_name = award_data['name'].lower()
            decrypted_description = award_data['description'].lower()

            # Check if the award matches the search term
            if search_pattern:
                if (
                    search_pattern in decrypted_name or
                    search_pattern in decrypted_description
                ):
                    award_list.append(award_data)
            else:
                award_list.append(award_data)

        # Calculate pagination manually
        total_items = len(award_list)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_awards = award_list[start:end]

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_awards"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Awards, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        # Prepare the response data
        response = {
            "status": "success",
            "status_code": 200,
            "awards": paginated_awards,
            "total_pages": (total_items + per_page - 1) // per_page,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        # Handle any database errors
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of awards: {str(e)}",
        }

    return jsonify(response), response["status_code"]



@custom_jwt_required
def get_award(award_id):
    award = Award.query.filter_by(id=award_id, deleted_at=None).first()
    if award:
        award_data = award.to_dict()
        return jsonify({'award': award_data})
    else:
        return jsonify({'message': 'Award not found'}), 404


@custom_jwt_required
def edit_award(award_id):
    award = Award.query.filter_by(id=award_id, deleted_at=None).first()

    if award is None:
        return jsonify({'message': 'Award not found'}), 404

    old_values = {
        "name": decrypt(award.name),
        "description": decrypt(award.description)
    }

    data = request.get_json()
    award_name = data.get('name')
    award_description = data.get('description')

    if not award_name or not award_description:
        return jsonify({'message': 'Name and description are required'}), 400

    award.name = encrypt(award_name)
    award.description = encrypt(award_description)

    try:
        award.update(name=award_name,description=award_description)
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_award"),
            "auditable_id": award.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"name": decrypt(award.name),
                 "description": decrypt(award.description)}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Award, Update"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Award updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating award', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_award(award_id):
    award = Award.query.filter_by(id=award_id, deleted_at=None).first()

    if award is None:
        return jsonify({'message': 'Award not found'}), 404

    try:
        award.soft_delete()
        db.session.commit()

        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_award"),
            "auditable_id": award.id,
            "old_values": encrypt(json.dumps(
                {
                    "name": decrypt(award.name),
                    "description": decrypt(award.description)
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Award, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({'message': 'Award deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting Award', 'error': str(e)}), 500
    finally:
        db.session.close()

@custom_jwt_required
def search_awards():
    search_query = request.args.get("q", "")

    # Use SQLAlchemy's ilike for case-insensitive search on email and username
    awards = Award.query.filter(
        or_(
            Award.name.ilike(f"%{search_query}%"),
            Award.description.ilike(f"%{search_query}%"),
        )
    ).all()

    if awards:
        award_list = [
            {
                "id": award.id,
                "name": award.name,
                "description": award.description,
                "deleted_at": award.deleted_at,
            }
            for award in awards
        ]
        response = {
            "status": "success",
            "status_code": 200,
            "users": award_list,
        }
    else:
        response = {
            "status": "error",
            "status_code": 404,
            "message": "No award found matching the search criteria",
        }

    return jsonify(response), response["status_code"]