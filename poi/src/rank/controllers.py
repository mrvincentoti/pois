import csv
import json
import os
from datetime import datetime

from flask import request, jsonify, g
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_
from werkzeug.utils import secure_filename

from .. import db
from ..app import app
from .models import Rank
from ..cadre.models import Cadre
from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import custom_jwt_required
from ..util import decrypt, encrypt

import pika

from ..util import encrypt


@custom_jwt_required
def add_rank():
    if request.method == "POST":
        data = request.get_json()
        rank_name = data.get("name")
        rank_description = data.get("description")
        rank_level = data.get("level")
        cadre_id = data.get("cadre_id")

        if not rank_name or not rank_description or not rank_level:
            return (
                jsonify({"message": "Name, description, and level are required"}),
                400,
            )

        # Ensure rank level is between 3 and 17
        if not 3 <= rank_level <= 17:
            return jsonify({"message": "Rank level must be between 3 and 17"}), 400

        # Check if a rank with the same name and cadre already exists
        existing_rank = Rank.query.filter_by(name=rank_name, cadre_id=cadre_id).first()
        if existing_rank:
            return (
                jsonify(
                    {"message": "A rank with the same name and cadre already exists"}
                ),
                400,
            )

        new_rank = Rank(
            name=rank_name,
            description=rank_description,
            level=rank_level,
            cadre_id=cadre_id,
        )

        try:
            db.session.add(new_rank)
            db.session.commit()

            # Audit
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("add_rank"),
                "auditable_id": new_rank.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {"name": rank_name, "description": rank_description,
                     "level": rank_level, "cadre_id": cadre_id}
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Setup, Rank, Create"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response_data = {
                "message": "Rank added successfully",
                "audit": audit_data,
            }
            return jsonify(response_data), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding rank", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_rank(rank_id):
    rank = Rank.query.filter_by(id=rank_id, deleted_at=None).first()
    if rank:
        rank_data = rank.to_dict()
        return jsonify({"rank": rank_data})
    else:
        return jsonify({"message": "Rank not found"}), 404


@custom_jwt_required
def get_rank_by_cadre(cadre_id):
    try:
        ranks = Rank.query.filter_by(cadre_id=cadre_id, deleted_at=None).all()
        rank_list = []

        for rank in ranks:
            rank_list.append(rank.to_dict())

        response = {
            "status": "success",
            "status_code": 200,
            "ranks": rank_list,
        }
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of lgas: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def edit_rank(rank_id):
    rank = Rank.query.filter_by(id=rank_id, deleted_at=None).first()

    if rank is None:
        return jsonify({"message": "Rank not found"}), 404

    # Record the old values before updating
    old_values = {
        "name": decrypt(rank.name),
        "description": decrypt(rank.description),
        "level": rank.level,
        "cadre_id": rank.cadre_id,
    }

    data = request.get_json()
    rank_name = data.get("name")
    rank_description = data.get("description")
    rank_level = data.get("level")
    cadre_id = data.get("cadre_id")

    if not rank_name or not rank_description or not rank_level:
        return jsonify({"message": "Name, description, and level are required"}), 400

    # Ensure rank level is between 3 and 17
    if not 3 <= rank_level <= 17:
        return jsonify({"message": "Rank level must be between 3 and 17"}), 400

    # Check if a rank with the same name and cadre already exists
    existing_rank = Rank.query.filter_by(name=rank_name, cadre_id=cadre_id).first()
    if existing_rank and existing_rank.id != rank_id:
        return (
            jsonify({"message": "A rank with the same name and cadre already exists"}),
            400,
        )

    try:
        rank.update(name=rank_name, description=rank_description, level=rank_level, cadre_id=cadre_id)
        db.session.commit()

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_rank"),
            "auditable_id": rank.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {"name": rank_name,
                 "description": rank_description,
                 "level": rank_level,
                 "cadre_id": cadre_id
                 }
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Rank, Update"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Rank updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating rank", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_rank(rank_id):
    rank = Rank.query.filter_by(id=rank_id, deleted_at=None).first()

    if rank is None:
        return jsonify({"message": "Rank not found"}), 404

    try:
        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_rank"),
            "auditable_id": rank.id,
            "old_values": encrypt(json.dumps(
                {
                    "name": decrypt(rank.name),
                    "description": decrypt(rank.description),
                    "level": rank.level,
                    "cadre_id": rank.cadre_id
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Rank, Delete"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        rank.soft_delete()
        db.session.commit()
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        return jsonify({"message": "Rank deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting rank", "error": str(e)}), 500
    finally:
        db.session.close()


# Get list of ranks
@custom_jwt_required
def list_ranks():
    try:
        # Get query parameters for pagination
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)
        search_query = request.args.get("q", "")

        # Base query
        ranks_query = Rank.query.filter_by(deleted_at=None)

        # Fetch all ranks and decrypt data locally
        all_ranks = ranks_query.all()

        # Decrypt and filter ranks
        decrypted_ranks = []
        search_pattern = search_query.lower() if search_query else None

        for rank in all_ranks:
            decrypted_name = decrypt(rank.name).lower()
            decrypted_description = decrypt(rank.description).lower()

            # Filter based on search query
            if search_pattern:
                if (search_pattern in decrypted_name or
                        search_pattern in decrypted_description):
                    decrypted_ranks.append(rank)
            else:
                decrypted_ranks.append(rank)

        # Paginate the filtered ranks
        total_items = len(decrypted_ranks)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_ranks = decrypted_ranks[start:end]

        # Prepare the rank list with decrypted data
        rank_list = []
        for rank in paginated_ranks:
            cadre = Cadre.query.filter_by(id=rank.cadre_id).first()
            rank_data = {
                "id": rank.id,
                "name": decrypt(rank.name),
                "description": decrypt(rank.description),
                "level": rank.level,
                "cadre": {
                    "id": cadre.id,
                    # Assuming cadre names are also encrypted
                    "name": decrypt(cadre.name),
                },
            }
            rank_list.append(rank_data)


        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_ranks"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Setup, Ranks, List"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        # Prepare the response data
        response = {
            "status": "success",
            "status_code": 200,
            "ranks": rank_list,
            "total_pages": (total_items + per_page - 1) // per_page,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of ranks: {str(e)}",
        }

    return jsonify(response), response["status_code"]



# Get list of ranks
@custom_jwt_required
def list_all_ranks():
    try:
        # Base query
        ranks_query = Rank.query.filter_by(deleted_at=None).all()

        rank_list = []
        for rank in ranks_query:
            rank_data = rank.to_dict()
            rank_list.append(rank_data)

        response = {
            "status": "success",
            "status_code": 200,
            "ranks": rank_list,
        }
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of ranks: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def restore_rank(rank_id):
    rank = Rank.query.filter_by(id=rank_id).first()

    if rank is None:
        return jsonify({"message": "Rank not found"}), 404

    try:
        rank.restore()
        db.session.commit()
        return jsonify({"message": "Rank restored successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring rank", "error": str(e)}), 500
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
        channel.queue_declare(queue=RABBITMQ_QUEUE)

        # Publish the message to the queue with mandatory flag
        channel.basic_publish(exchange='',
                              routing_key=RABBITMQ_QUEUE,
                              body=message,
                              mandatory=True)  # Set mandatory flag

        connection.close()  # Close the connection

        return jsonify({'status': 'Message published successfully'})
    except Exception as e:
        return jsonify({'error': str(e)})


def get_message():
    pass


@custom_jwt_required
def import_ranks():
    if request.method == "POST":
        try:
            if 'file' not in request.files:
                return jsonify({"message": "File not found"}), 404

            ranks = []

            file = request.files['file']
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            with open(filepath) as file:
                csv_file = csv.reader(file)

                # Load all cadres and decrypt their names
                cadres = Cadre.query.filter_by(deleted_at=None).all()
                decrypted_cadres = {
                    decrypt(cadre.name): cadre for cadre in cadres}

                for row in csv_file:
                    rank_name = row[0]
                    rank_description = row[1]
                    rank_level = row[2]
                    cadre_name = row[3]

                    if rank_level == 'level':
                        continue

                    # Convert level to integer
                    try:
                        rank_level = int(rank_level, 10)
                    except ValueError:
                        print('Invalid rank level')
                        continue

                    # Find cadre by decrypted name
                    cadre = decrypted_cadres.get(cadre_name)
                    if not cadre:
                        print(f'Cadre {cadre_name} not found')
                        continue

                    if not rank_name or not rank_description or not rank_level:
                        print('Name, description, and level are required')
                        continue

                    # Ensure rank level is between 3 and 17
                    if not 3 <= rank_level <= 17:
                        print('Rank level must be between 3 and 17')
                        continue

                    # Check if a rank with the same name and cadre already exists
                    existing_rank = Rank.query.filter_by(
                        name=encrypt(rank_name), cadre_id=cadre.id).first()
                    if existing_rank:
                        print('A rank with the same name and cadre already exists')
                        continue

                    # Create a new rank with encrypted name and description
                    new_rank = Rank(
                        name=rank_name,
                        description=rank_description,
                        level=rank_level,
                        cadre_id=cadre.id,
                    )
                    db.session.add(new_rank)
                    db.session.commit()

                    ranks.append({
                        "id": new_rank.id,
                        "name": new_rank.name,
                        "description": new_rank.description,
                        "level": new_rank.level,
                        "cadre": {
                            "id": cadre.id,
                            "name": cadre.name,
                        },
                    })

                    # Audit
                    current_time = datetime.utcnow()
                    audit_data = {
                        "user_id": g.user["id"] if hasattr(g, "user") else None,
                        "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                        "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                        "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                        "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                        "event": "import_ranks",
                        "auditable_id": new_rank.id,
                        "old_values": None,
                        "new_values": json.dumps(
                            {"name": rank_name, "description": rank_description,
                             "level": rank_level, "cadre_id": cadre.id}
                        ),
                        "url": request.url,
                        "ip_address": request.remote_addr,
                        "user_agent": request.user_agent.string,
                        "tags": "Setup, Rank, Create",
                        "created_at": current_time.isoformat(),
                        "updated_at": current_time.isoformat(),
                    }

                    serialized_data = json.dumps(audit_data)
                    publish_to_rabbitmq(serialized_data)

            response_data = {
                "message": "Ranks imported successfully",
                "audit": ranks,
            }

            return jsonify(response_data), 201
        except Exception as e:
            return jsonify({"message": "Error occurred while importing ranks", "error": str(e)}), 500
        finally:
            db.session.close()