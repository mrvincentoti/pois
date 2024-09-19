from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import Source
from ..util import custom_jwt_required, save_audit_data

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def get_sources():
    try:
        sources = Source.query.all()

        source_list = []
        for source in sources:
            source_data = source.to_dict()
            source_list.append(source_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'sources': source_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def add_source():
    if request.method == "POST":
        data = request.get_json()
        source_name = data.get("name")

        if not source_name:
            return jsonify({"message": "Name is required"}), 400

        new_source = Source(
            name=source_name
        )

        try:
            db.session.add(new_source)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_source",
                "auditable_id": new_source.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "source_name": source_name
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Source, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Source added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding source", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_source(source_id):
    source = Source.query.filter_by(id=source_id, deleted_at=None).first()
    if source:
        source_data = {
            "id": source.id,
            "name": source.name
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_source",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Auth, Source, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"source": source_data})
    else:
        return jsonify({"message": "Source not found"}), 404


@custom_jwt_required
def edit_source(source_id):
    source = Source.query.filter_by(id=source_id, deleted_at=None).first()

    if source is None:
        return jsonify({"message": "Source not found"}), 404

    data = request.get_json()
    source_name = data.get("name")

    if not source_name:
        return jsonify({"message": "Name is required"}), 400

    source.name = source_name

    try:
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"edit_source",
                "auditable_id": source.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "source_name": source_name
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Source, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Source updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating source", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_source(source_id):
    source = Source.query.filter_by(id=source_id, deleted_at=None).first()

    if source is None:
        return jsonify({"message": "Source not found"}), 404

    try:
        source.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"delete_source",
                "auditable_id": source.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "source_name": source.name,
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Source, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Source deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting source", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_source(source_id):
    source = Source.query.filter_by(id=source_id).first()

    if source is None:
        return jsonify({"message": "Source not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_source",
            "auditable_id": source.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": source.name,
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Setup, Source, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        source.restore()
        db.session.commit()
        return (
            jsonify({"message": "Source restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring source", "error": str(e)}), 500
    finally:
        db.session.close()