from flask import request, jsonify, json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import Module
from ..util import custom_jwt_required, save_audit_data


@custom_jwt_required
def add_module():
    if request.method == "POST":
        data = request.get_json()
        module_name = data.get("name")
        module_description = data.get("description")

        if not module_name or not module_description:
            return jsonify({"message": "Name and description are required"}), 400

        new_module = Module(name=module_name, description=module_description)

        try:
            db.session.add(new_module)
            db.session.commit()

            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "add_module",
                "auditable_id": new_module.id,
                "old_values": None,
                "new_values": json.dumps(
                    {"module_name": module_name, "module_description": module_description}
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Module, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)

            return jsonify({"message": "Module added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding module", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def list_modules():
    try:
        # Get query parameters for pagination
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)

        # Get query parameters for pagination and search
        search_query = request.args.get("q", "")

        # Base query
        modules_query = Module.query

        # If search query is not empty
        if search_query:
            modules_query = modules_query.filter(
                or_(
                    Module.name.ilike(f"%{search_query}%"),
                    Module.description.ilike(f"%{search_query}%"),
                )
            )

        # Paginate the Module query
        modules_paginated = modules_query.paginate(page=page, per_page=per_page)

        module_list = []
        for module in modules_paginated.items:
            module_data = {
                "id": module.id,
                "name": module.name,
                "description": module.description,
                # Add other fields as needed
            }
            module_list.append(module_data)

        response = {
            "status": "success",
            "status_code": 200,
            "modules": module_list,
            "total_pages": modules_paginated.pages,
            "current_page": modules_paginated.page,
            "total_items": modules_paginated.total,
        }
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of modules: {str(e)}",
        }

    return jsonify(response), response["status_code"]


def get_module(module_id):
    module = Module.query.filter_by(id=module_id, deleted_at=None).first()
    if module:
        module_data = {
            "id": module.id,
            "name": module.name,
            "description": module.description,
        }
        return jsonify({"module": module_data})
    else:
        return jsonify({"message": "Module not found"}), 404


@custom_jwt_required
def edit_module(module_id):
    module = Module.query.filter_by(id=module_id, deleted_at=None)

    if module is None:
        return jsonify({"message": "Module not found"}), 404

    data = request.get_json()
    module_name = data.get("name")
    module_description = data.get("description")

    if not module_name or not module_description:
        return jsonify({"message": "Name and description are required"}), 400

    module.name = module_name
    module.description = module_description

    try:
        db.session.commit()

        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "edit_module",
                "auditable_id": module_id,
                "old_values": json.dumps(
                    {"module_name": module.name, "module_description": module.description}
                ),
                "new_values": json.dumps(
                    {"module_name": module_name, "module_description": module_description}
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Module, Update, Edit",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

        save_audit_data(audit_data)

        return jsonify({"message": "Module updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating module", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_module(module_id):
    module = Module.query.filter_by(id=module_id, deleted_at=None).first()

    if module is None:
        return jsonify({"message": "Module not found"}), 404

    try:
        module.soft_delete()
        db.session.commit()

        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "delete_module",
                "auditable_id": module.id,
                "old_values": json.dumps(
                    {"module_name": module.name, "module_description": module.description}
                ),
                "new_values": None,
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Module, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

        save_audit_data(audit_data)

        return jsonify({"message": "Module deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting module", "error": str(e)}), 500
    finally:
        db.session.close()

@custom_jwt_required
def restore_module(module_id):
    module = Module.query.filter_by(id=module_id).first()

    if module is None:
        return jsonify({"message": "Module not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_module",
            "auditable_id": module.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": module.name,
                    "description": module.description,
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Setup, Module, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        module.restore()
        db.session.commit()
        return (
            jsonify({"message": "Module restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring module", "error": str(e)}), 500
    finally:
        db.session.close()

def seed_data():
    try:
        Module.create_seed_data()
        db.session.commit()
        return jsonify({'message': 'Modules Data seeded successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error seeding data', 'error': str(e)}), 500
    finally:
        db.session.close()
