from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import Crime
from ..util import custom_jwt_required, save_audit_data

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def get_crimes():
    try:
        crimes = Crime.query.all()

        crime_list = []
        for crime in crimes:
            crime_data = crime.to_dict()
            crime_list.append(crime_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'crimes': crime_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def add_crime():
    if request.method == "POST":
        data = request.get_json()
        crime_name = data.get("name")

        if not crime_name:
            return jsonify({"message": "Name is required"}), 400

        new_crime = Crime(
            name=crime_name
        )

        try:
            db.session.add(new_crime)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_crime",
                "auditable_id": new_crime.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "crime_name": crime_name
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Crime, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Crime added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding crime", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_crime(crime_id):
    crime = Crime.query.filter_by(id=crime_id, deleted_at=None).first()
    if crime:
        crime_data = {
            "id": crime.id,
            "name": crime.name
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_crime",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Crime, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"crime": crime_data})
    else:
        return jsonify({"message": "Crime not found"}), 404


@custom_jwt_required
def edit_crime(crime_id):
    crime = Crime.query.filter_by(id=crime_id, deleted_at=None).first()

    if crime is None:
        return jsonify({"message": "Crime not found"}), 404

    data = request.get_json()
    crime_name = data.get("name")

    if not crime_name:
        return jsonify({"message": "Name is required"}), 400

    crime.name = crime_name

    try:
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"edit_crime",
                "auditable_id": crime.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "crime_name": crime_name
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Crime, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Crime updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating crime", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_crime(crime_id):
    crime = Crime.query.filter_by(id=crime_id, deleted_at=None).first()

    if crime is None:
        return jsonify({"message": "Crime not found"}), 404

    try:
        crime.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"delete_crime",
                "auditable_id": crime.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "crime_name": crime.name,
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Crime, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Crime deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting crime", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_crime(crime_id):
    crime = Crime.query.filter_by(id=crime_id).first()

    if crime is None:
        return jsonify({"message": "Crime not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_crime",
            "auditable_id": crime.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": crime.name,
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Crime, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        crime.restore()
        db.session.commit()
        return (
            jsonify({"message": "Crime restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring crime", "error": str(e)}), 500
    finally:
        db.session.close()