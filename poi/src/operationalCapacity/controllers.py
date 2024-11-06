from flask import request, jsonify, json, g
from datetime import datetime
from .. import db
from ..util import custom_jwt_required, save_audit_data, permission_required
from .models import OperationalCapacity

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
@permission_required
def create_operational_capacity():
    try:
        data = request.get_json()
        current_time = datetime.utcnow()
        created_by = g.user["id"]

        new_capacity = OperationalCapacity(
            type_id=data["type_id"],
            org_id=data["org_id"],
            item=data["item"],
            qty=data["qty"],
            created_by=created_by,
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

        return jsonify({"message": "Item added successfully"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@custom_jwt_required
@permission_required
def get_operational_capacity_by_org(org_id):
    try:
        # Get search parameters from the request arguments
        search_term = request.args.get('q', '')  # Search keyword
        page = request.args.get('page', 1, type=int)  # Page number (default is 1)
        per_page = request.args.get('per_page', 10, type=int)  # Items per page (default is 10)

        # Query the OperationalCapacity table, filtering by org_id and search term, if provided
        query = OperationalCapacity.query.filter(
            OperationalCapacity.org_id == org_id,
            OperationalCapacity.deleted_at == None
        )

        # Apply search filter if a search term is provided
        if search_term:
            search_pattern = f"%{search_term}%"  # Search pattern for LIKE query
            query = query.filter(OperationalCapacity.item.ilike(search_pattern))

        # Order by created_at in descending order (newest first)
        query = query.order_by(OperationalCapacity.created_at.desc())

        # Paginate the results
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        # Get the paginated records
        operational_capacities = pagination.items

        # Prepare the list of operational capacities to return
        capacity_list = [capacity.to_dict() for capacity in operational_capacities]

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"],
            "first_name": g.user["first_name"],
            "last_name": g.user["last_name"],
            "pfs_num": g.user["pfs_num"],
            "user_email": g.user["email"],
            "event": "list_operational_capacity",
            "auditable_id": org_id,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "OperationalCapacity, List",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)
        
        # Return the paginated list of capacities with pagination metadata
        return jsonify({
            "status": "success",
            "status_code": 200,
            "page": pagination.page,
            "pages": pagination.pages,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev,
            "capacities": capacity_list,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@custom_jwt_required
@permission_required
def update_operational_capacity(id):
    try:
        capacity = OperationalCapacity.query.get(id)
        if not capacity or capacity.deleted_at:
            return jsonify({"message": "Item not found"}), 404

        data = request.get_json()
        old_values = capacity.to_dict()
        current_time = datetime.utcnow()

        capacity.type_id = data.get("type_id", capacity.type_id)
        capacity.item = data.get("item", capacity.item)
        capacity.qty = data.get("qty", capacity.qty)
        capacity.description = data.get("description", capacity.description)
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


@custom_jwt_required
@permission_required
def delete_operational_capacity(id):
    try:
        capacity = OperationalCapacity.query.get(id)
        if not capacity or capacity.deleted_at:
            return jsonify({"message": "Item not found"}), 404

        current_time = datetime.utcnow()
        capacity.deleted_at = current_time
        db.session.commit()

        # Audit log for deletion
        audit_data = {
            "user_id": g.user["id"],
            "first_name": g.user["first_name"],
            "last_name": g.user["last_name"],
            "pfs_num": g.user["pfs_num"],
            "user_email": g.user["email"],
            "event": "delete_operational_capacity",
            "auditable_id": capacity.id,
            "old_values": json.dumps(capacity.to_dict()),
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "OperationalCapacity, Delete",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        return jsonify({"message": "Item deleted"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@custom_jwt_required
@permission_required
def restore_operational_capacity(id):
    try:
        capacity = OperationalCapacity.query.get(id)
        if not capacity or not capacity.deleted_at:
            return jsonify({"message": "Item not found or not deleted"}), 404

        capacity.deleted_at = None
        capacity.updated_at = datetime.utcnow()
        db.session.commit()

        # Audit log for restoration
        audit_data = {
            "user_id": g.user["id"],
            "first_name": g.user["first_name"],
            "last_name": g.user["last_name"],
            "pfs_num": g.user["pfs_num"],
            "user_email": g.user["email"],
            "event": "restore_operational_capacity",
            "auditable_id": capacity.id,
            "old_values": None,
            "new_values": json.dumps(capacity.to_dict()),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "OperationalCapacity, Restore",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

        return jsonify(capacity.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500 