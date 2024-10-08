from flask import request, jsonify, g
from .. import db
from .models import PoiStatus
from ..util import save_audit_data, custom_jwt_required
from datetime import datetime as dt
import json


@custom_jwt_required
def get_poi_statuses():
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    search_term = request.args.get('q', default=None, type=str)

    query = PoiStatus.query

    # Apply search term filter
    if search_term:
        search = f"%{search_term}%"
        query = query.filter(PoiStatus.name.ilike(search))

    # Paginate and sort the results
    query = query.order_by(PoiStatus.id.asc())
    paginated_status = query.paginate(page=page, per_page=per_page, error_out=False)

    # Format response
    status_list = [status.to_dict() for status in paginated_status.items]

    response = {
        'total': paginated_status.total,
        'pages': paginated_status.pages,
        'current_page': paginated_status.page,
        'statuses': status_list,
        'status': 'success',
        'status_code': 200
    }

    # Audit logging
    audit_data = {
        "user_id": g.user["id"] if hasattr(g, "user") else None,
        "first_name": g.user["first_name"] if hasattr(g, "user") else None,
        "last_name": g.user["last_name"] if hasattr(g, "user") else None,
        "event": "view_poi_statuses",
        "new_values": json.dumps({
            "searched_term": search_term
        }),
        "url": request.url,
        "ip_address": request.remote_addr,
        "user_agent": request.user_agent.string,
        "tags": "PoiStatus, List",
        "created_at": dt.utcnow().isoformat(),
        "updated_at": dt.utcnow().isoformat(),
    }
    save_audit_data(audit_data)

    return jsonify(response), response.get('status_code', 200)

@custom_jwt_required
def get_poi_status(status_id):
    status = PoiStatus.query.get_or_404(status_id)
    return jsonify(status.to_dict()), 200

@custom_jwt_required
def create_poi_status():
    data = request.get_json()
    try:
        new_status = PoiStatus(id=data.get('id'), name=data.get('name'))
        db.session.add(new_status)
        db.session.commit()

        response = {
            'status': 'success',
            'status_code': 201,
            'message': 'PoiStatus created successfully',
            'poi_status': new_status.to_dict()
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "create_poi_status",
            "new_values": json.dumps(new_status.to_dict()),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "PoiStatus, Create",
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

    except Exception as e:
        db.session.rollback()
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred while creating the PoiStatus: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)


@custom_jwt_required
def update_poi_status(status_id):
    data = request.get_json()
    status = PoiStatus.query.get_or_404(status_id)

    try:
        old_values = status.to_dict()
        status.name = data.get('name', status.name)

        db.session.commit()

        response = {
            'status': 'success',
            'status_code': 200,
            'message': 'PoiStatus updated successfully',
            'poi_status': status.to_dict()
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "update_poi_status",
            "auditable_id": status.id,
            "old_values": json.dumps(old_values),
            "new_values": json.dumps(status.to_dict()),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "PoiStatus, Update",
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

    except Exception as e:
        db.session.rollback()
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred while updating the PoiStatus: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)


@custom_jwt_required
def delete_poi_status(status_id):
    status = PoiStatus.query.get_or_404(status_id)

    try:
        db.session.delete(status)
        db.session.commit()

        response = {
            'status': 'success',
            'status_code': 200,
            'message': 'PoiStatus deleted successfully'
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "delete_poi_status",
            "auditable_id": status.id,
            "old_values": json.dumps(status.to_dict()),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "PoiStatus, Delete",
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

    except Exception as e:
        db.session.rollback()
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred while deleting the PoiStatus: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)