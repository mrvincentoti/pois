from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import ArmsRecovered
from ..util import custom_jwt_required, save_audit_data

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def get_arms():
    try:
        arms = Arm.query.all()

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
def add_arm():
    if request.method == "POST":
        data = request.get_json()
        arm_name = data.get("name")

        if not arm_name:
            return jsonify({"message": "Name is required"}), 400

        new_arm = Arm(
            name=arm_name
        )

        try:
            db.session.add(new_arm)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_arm",
                "auditable_id": new_arm.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "arm_name": arm_name
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Arm, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Arm added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding arm", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_arm(arm_id):
    arm = Arm.query.filter_by(id=arm_id, deleted_at=None).first()
    if arm:
        arm_data = {
            "id": arm.id,
            "name": arm.name
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_arm",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Auth, Arm, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"arm": arm_data})
    else:
        return jsonify({"message": "Arm not found"}), 404


@custom_jwt_required
def edit_arm(arm_id):
    arm = Arm.query.filter_by(id=arm_id, deleted_at=None).first()

    if arm is None:
        return jsonify({"message": "Arm not found"}), 404

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
                "event":"edit_arm",
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
                "tags": "Auth, Arm, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Arm updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating arm", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_arm(arm_id):
    arm = Arm.query.filter_by(id=arm_id, deleted_at=None).first()

    if arm is None:
        return jsonify({"message": "Arm not found"}), 404

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
                "event":"delete_arm",
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
                "tags": "Auth, Arm, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Arm deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting arm", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_arm(arm_id):
    arm = Arm.query.filter_by(id=arm_id).first()

    if arm is None:
        return jsonify({"message": "Arm not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_arm",
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
            "tags": "Setup, Arm, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        arm.restore()
        db.session.commit()
        return (
            jsonify({"message": "Arm restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring arm", "error": str(e)}), 500
    finally:
        db.session.close()