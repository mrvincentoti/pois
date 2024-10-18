from flask import request, jsonify, json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from ..arms.models import Arm
from ..poi.models import Poi
from ..users.models import User
from ..util import custom_jwt_required, save_audit_data
from .models import OperationalCapacity

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def create_operational_capacity():
    try:
        data = request.get_json()
        current_time = datetime.utcnow()

        new_capacity = OperationalCapacity(
            type_id=data["type_id"],
            org_id=data["org_id"],
            item=data["item"],
            qty=data["qty"],
            created_by=g.user["id"],
        )

        db.session.add(new_capacity)
        db.session.commit()

        # Audit log for creation
        audit_data = {
            "user_id": g.user["id"],
            "first_name": g.user["first_name"],
            "last_name": g.user["last_name"],
            "pfs_num": g.user["pfs_num"],
            "user_email": g.user["email"],
            "event": "create_operational_capacity",
            "auditable_id": new_capacity.id,
            "old_values": None,
            "new_values": json.dumps(new_capacity.to_dict()),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "OperationalCapacity, Create",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        return jsonify({"message": "Operational capacity added successfully"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@custom_jwt_required
def get_operational_capacity_by_org(org_id):
    try:
        capacities = OperationalCapacity.query.filter_by(org_id=org_id, deleted_at=None).all()
        if not capacities:
            return jsonify({"message": "No operational capacities found"}), 404

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"],
            "first_name": g.user["first_name"],
            "last_name": g.user["last_name"],
            "pfs_num": g.user["pfs_num"],
            "user_email": g.user["email"],
            "event": "update_operational_capacity",
            "auditable_id": org_id,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "OperationalCapacity, Update",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)
        
        return jsonify([capacity.to_dict() for capacity in capacities]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@custom_jwt_required
def update_operational_capacity(id):
    try:
        capacity = OperationalCapacity.query.get(id)
        if not capacity or capacity.deleted_at:
            return jsonify({"message": "Operational capacity not found"}), 404

        data = request.get_json()
        old_values = capacity.to_dict()
        current_time = datetime.utcnow()

        capacity.type_id = data.get("type_id", capacity.type_id)
        capacity.item = data.get("item", capacity.item)
        capacity.qty = data.get("qty", capacity.qty)
        capacity.updated_at = current_time

        db.session.commit()

        # Audit log for update
        audit_data = {
            "user_id": g.user["id"],
            "first_name": g.user["first_name"],
            "last_name": g.user["last_name"],
            "pfs_num": g.user["pfs_num"],
            "user_email": g.user["email"],
            "event": "update_operational_capacity",
            "auditable_id": capacity.id,
            "old_values": json.dumps(old_values),
            "new_values": json.dumps(capacity.to_dict()),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "OperationalCapacity, Update",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        return jsonify(capacity.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
