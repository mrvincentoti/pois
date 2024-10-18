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


