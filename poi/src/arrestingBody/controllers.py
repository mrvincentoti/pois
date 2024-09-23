from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import ArrestingBody
from ..util import custom_jwt_required, save_audit_data

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def get_arresting_bodies():
    try:
        arresting_bodies = ArrestingBody.query.all()

        arresting_body_list = []
        for arresting_body in arresting_bodies:
            arresting_body_data = arresting_body.to_dict()
            arresting_body_list.append(arresting_body_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'arresting_bodies': arresting_body_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def add_arresting_body():
    if request.method == "POST":
        data = request.get_json()
        arresting_body_name = data.get("name")

        if not arresting_body_name:
            return jsonify({"message": "Name is required"}), 400

        new_arresting_body = ArrestingBody(
            name=arresting_body_name
        )

        try:
            db.session.add(new_arresting_body)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_arresting_body",
                "auditable_id": new_arresting_body.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "arresting_body_name": arresting_body_name
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "ArrestingBody, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Arresting body added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding arresting body", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_arresting_body(arresting_body_id):
    arresting_body = ArrestingBody.query.filter_by(id=arresting_body_id, deleted_at=None).first()
    if arresting_body:
        arresting_body_data = {
            "id": arresting_body.id,
            "name": arresting_body.name
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_arresting_body",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "ArrestingBody, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"arresting_body": arresting_body_data})
    else:
        return jsonify({"message": "Arresting body not found"}), 404


@custom_jwt_required
def edit_arresting_body(arresting_body_id):
    arresting_body = ArrestingBody.query.filter_by(id=arresting_body_id, deleted_at=None).first()

    if arresting_body is None:
        return jsonify({"message": "Arresting body not found"}), 404

    data = request.get_json()
    arresting_body_name = data.get("name")

    if not arresting_body_name:
        return jsonify({"message": "Name is required"}), 400

    arresting_body.name = arresting_body_name

    try:
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"edit_arresting_body",
                "auditable_id": arresting_body.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "arresting_body_name": arresting_body_name
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "ArrestingBody, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Arresting body updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating arresting body", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_arresting_body(arresting_body_id):
    arresting_body = ArrestingBody.query.filter_by(id=arresting_body_id, deleted_at=None).first()

    if arresting_body is None:
        return jsonify({"message": "Arresting body not found"}), 404

    try:
        arresting_body.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"delete_arresting_body",
                "auditable_id": arresting_body.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "arresting_body_name": arresting_body.name,
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "ArrestingBody, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Arresting body deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting arresting body", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_arresting_body(arresting_body_id):
    arresting_body = ArrestingBody.query.filter_by(id=arresting_body_id).first()

    if arresting_body is None:
        return jsonify({"message": "Arresting body not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_arresting_body",
            "auditable_id": arresting_body.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": arresting_body.name,
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "ArrestingBody, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        arresting_body.restore()
        db.session.commit()
        return (
            jsonify({"message": "Arresting body restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring arresting body", "error": str(e)}), 500
    finally:
        db.session.close()