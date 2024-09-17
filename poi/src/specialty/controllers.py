import json
import os
from datetime import datetime

from flask import request, jsonify, g
import uuid
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import custom_jwt_required
from sqlalchemy import or_
import logging
import pika
from ..util import decrypt, encrypt

logger = logging.getLogger(__name__)

from .. import db
from .models import Specialty


@custom_jwt_required
def add_specialty():
    if request.method == 'POST':
        data = request.get_json()
        specialty_name = data.get('name')

        if not specialty_name:
            return jsonify({'message': 'Specialty name is required'}), 400

        new_specialty = Specialty(name=specialty_name)

        try:
            db.session.add(new_specialty)
            db.session.commit()

            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("add_speciality"),
                "auditable_id": new_specialty.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"name": specialty_name, "description": specialty_name}
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Speciality, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response_data = {
                "message": "Specialty added successfully",
                "audit": audit_data,
            }
            return jsonify(response_data), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error adding specialty', 'error': str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_specialties():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)

        # Base query for non-deleted specialties
        specialty_query = Specialty.query.filter_by(deleted_at=None)

        # Fetch all specialties
        all_specialties = specialty_query.all()

        # Decrypt and filter data locally
        specialty_list = []
        search_pattern = search_term.lower() if search_term else None

        for specialty in all_specialties:
            specialty_data = specialty.to_dict()
            decrypted_name = specialty_data['name'].lower()

            # Check if the specialty matches the search term
            if search_pattern:
                if search_pattern in decrypted_name:
                    specialty_list.append(specialty_data)
            else:
                specialty_list.append(specialty_data)

        # Calculate pagination manually
        total_items = len(specialty_list)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_specialties = specialty_list[start:end]

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_specialties"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Specialties, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        # Prepare the response data
        response = {
            "status": "success",
            "status_code": 200,
            "specialties": paginated_specialties,
            "total_pages": (total_items + per_page - 1) // per_page,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        # Handle any database errors
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of specialties: {str(e)}",
        }

    return jsonify(response), response["status_code"]



@custom_jwt_required
def list_all_specialties():
    try:
        specialty_query = Specialty.query.filter_by(deleted_at=None).all()

        specialty_list = []

        for specialty in specialty_query:
            specialty_data = specialty.to_dict()
            specialty_list.append(specialty_data)

        response = {
            "status": "success",
            "status_code": 200,
            "specialties": specialty_list,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of users: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_specialty(specialty_id):
    specialty = Specialty.query.filter_by(id=specialty_id).first()
    if specialty:
        specialty_data = specialty.to_dict()
        return jsonify({'specialty': specialty_data})
    else:
        return jsonify({'message': 'Specialty not found'}), 404


@custom_jwt_required
def edit_specialty(specialty_id):
    specialty = Specialty.query.filter_by(id=specialty_id, deleted_at=None).first()

    if specialty is None:
        return jsonify({'message': 'Specialty not found'}), 404

    # Record the old values before updating
    old_values = {
        "name": decrypt(specialty.name)
    }

    data = request.get_json()
    new_specialty_name = data.get('name')

    if not new_specialty_name:
        return jsonify({"message": "Name required"}), 400

    specialty.name = encrypt(new_specialty_name)

    try:
        db.session.commit()
        specialty.update(name=new_specialty_name)
        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_speciality"),
            "auditable_id": specialty.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"name": new_specialty_name}
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Speciality, Update"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Speciality updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating specialty', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_specialty(specialty_id):
    specialty = Specialty.query.filter_by(id=specialty_id).first()

    if specialty is None:
        return jsonify({'message': 'Specialty not found'}), 404
    try:
        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_speciality"),
            "auditable_id": specialty.id,
            "old_values": encrypt(json.dumps(
                {
                    "name": decrypt(specialty.name)
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Speciality, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        specialty.soft_delete()
        db.session.commit()
        return (
            jsonify({"message": "Speciality deleted successfully", "audit": audit_data}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting specialty', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_specialty(specialty_id):
    specialty = Specialty.query.filter_by(id=specialty_id).first()

    if specialty is None:
        return jsonify({'message': 'Specialty not found'}), 404

    try:
        specialty.restore()
        db.session.commit()
        return jsonify({'message': 'Specialty restored successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error restoring specialty', 'error': str(e)}), 500
    finally:
        db.session.close()


# RabbitMQ configurations
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST')
RABBITMQ_QUEUE = os.getenv('QUEUE_NAME')
RABBITMQ_USER = os.getenv('RABBITMQ_USER')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', '5672'))


def post_message():
    try:
        # Get the message from the request
        message = request.json.get('message')

        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        parameters = pika.ConnectionParameters(
            host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()

        # Declare the queue if it doesn't exist
        channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)

        # Publish the message to the queue
        channel.basic_publish(exchange='',
                              routing_key=RABBITMQ_QUEUE,
                              body=message)

        connection.close()  # Close the connection

        return jsonify({'status': 'Message published successfully'})
    except Exception as e:
        return jsonify({'error': str(e)})


def get_message():
    pass
