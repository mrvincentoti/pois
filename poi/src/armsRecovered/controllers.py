from flask import request, jsonify, json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import ArmsRecovered
from ..arms.models import Arms
from ..poi.models import Poi
from ..util import custom_jwt_required, save_audit_data

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def get_arms_recovered():
    try:
        arms = ArmsRecovered.query.all()

        arm_list = []
        for arm in arms:
            arm_data = arm.to_dict()
            arm_list.append(arm_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'arms': arm_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def add_arm_recovered():
    if request.method == "POST":
        data = request.get_json()
        arm_id = data.get("arm_id")
        poi_id = data.get("poi_id")
        location = data.get("location")
        comments = data.get("comments")
        recovery_date = data.get("recovery_date")
        created_by = g.user["id"]

        new_recovered_arm = ArmsRecovered(
            arm_id=arm_id,
            poi_id=poi_id,
            location=location,
            comments=comments,
            recovery_date=recovery_date,
            created_by=created_by
        )

        try:
            db.session.add(new_recovered_arm)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_recovered_arm",
                "auditable_id": new_recovered_arm.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "arm_id": arm_id,
                        "poi_id":poi_id,
                        "location":location,
                        "comments":comments,
                        "recovery_date":recovery_date,
                        "created_by":created_by
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "ArmsRecovered, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Recovered arm added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding arm recovered", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_arm_recovered(recovery_id):
    arm = ArmsRecovered.query.filter_by(id=recovery_id, deleted_at=None).first()
    arm_recovery = ArmsRecovered.query.filter_by(id=recovery_id, deleted_at=None).first()
    
    if arm_recovery:
        # Fetch the associated arm name
        arm = Arms.query.filter_by(id=arm_recovery.arm_id, deleted_at=None).first()
        arm_name = arm.name if arm else "Unknown Arm"

        # Fetch the associated POI details
        poi = Poi.query.filter_by(id=arm_recovery.poi_id, deleted_at=None).first()
        if poi:
            poi_name = f"{poi.first_name} {poi.middle_name or ''} {poi.last_name} ({poi.alias or ''})".strip()
        else:
            poi_name = "Unknown POI"

        # Fetch the name of the user who created the record
        created_by = User.query.filter_by(id=arm_recovery.created_by, deleted_at=None).first()
        created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"

        # Prepare the response data with the fetched names
        arm_data = {
            "arm_id": arm_recovery.id,
            "arm_name": arm_name,
            "poi_id": arm.poi_id,
            "poi_name": poi_name,
            "location": arm_recovery.location,
            "comments": arm_recovery.comments,
            "recovery_date": arm_recovery.recovery_date,
            "created_by_id": arm.created_by,
            "created_by": created_by_name
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_recovered_arm",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "ArmsRecovered, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"arm": arm_data})
    else:
        return jsonify({"message": "Arm Recovered not found"}), 404


@custom_jwt_required
def edit_arm_recovered(recovery_id):
    arm = ArmsRecovered.query.filter_by(id=recovery_id, deleted_at=None).first()

    if arm is None:
        return jsonify({"message": "ArmsRecovered not found"}), 404

    data = request.get_json()
    arm_name = data.get("name")

    if not arm_name:
        return jsonify({"message": "Name is required"}), 400

    arm.name = arm_name

    try:
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"edit_recovered_arm",
                "auditable_id": arm.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "arm_name": arm_name
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, ArmsRecovered, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "ArmsRecovered updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating arm", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_arm_recovered(recovery_id):
    arm = ArmsRecovered.query.filter_by(id=recovery_id, deleted_at=None).first()

    if arm is None:
        return jsonify({"message": "ArmsRecovered not found"}), 404

    try:
        arm.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"delete_recovered_arm",
                "auditable_id": arm.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "arm_name": arm.name,
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, ArmsRecovered, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "ArmsRecovered deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting arm", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_arm_recovered(recovery_id):
    arm = ArmsRecovered.query.filter_by(id=recovery_id).first()

    if arm is None:
        return jsonify({"message": "ArmsRecovered not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_recovered_arm",
            "auditable_id": arm.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": arm.name,
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Setup, ArmsRecovered, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        arm.restore()
        db.session.commit()
        return (
            jsonify({"message": "ArmsRecovered restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring arm", "error": str(e)}), 500
    finally:
        db.session.close()