from operator import and_

from flask import request, jsonify, g
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import or_, func, exists, desc

from ..rabbitmq_manager import publish_to_rabbitmq
from sqlalchemy.orm import joinedload
import json
from .. import db
from .models import Audit
from ..util import custom_jwt_required

@custom_jwt_required
def get_all_audits():
    try:
        # Handle audit filtering and pagination
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)
        from_date_str = request.args.get('from_date', default=None, type=str)
        to_date_str = request.args.get('to_date', default=None, type=str)
        module = request.args.get('module', default=None, type=str)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        audit_query = Audit.query.order_by(desc(Audit.created_at))

        # Filter by date range
        if from_date_str and to_date_str:
            from_date = datetime.strptime(from_date_str, "%Y-%m-%d")
            to_date = datetime.strptime(to_date_str, "%Y-%m-%d")
            audit_query = audit_query.filter(and_(Audit.updated_at >= from_date, Audit.updated_at <= to_date))
        
        # Filter by module tag
        if module:
            audit_query = audit_query.filter(Audit.tags.like(f"%{module}%"))

        # Filter by created date (start_date, end_date)
        if start_date and end_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            audit_query = audit_query.filter(Audit.created_at.between(start_date, end_date))
        elif start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            audit_query = audit_query.filter(Audit.created_at >= start_date)
        elif end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            audit_query = audit_query.filter(Audit.created_at <= end_date)

        # Paginate the results
        audits = audit_query.paginate(page=page, per_page=per_page)
        audit_list = []

        # Filter by search term if provided
        for audit in audits.items:
            if search_term:
                if not any(search_term.lower() in field.lower() for field in [
                    audit.event, audit.tags, audit.old_values, audit.new_values, audit.url, audit.ip_address, audit.user_agent
                ]):
                    continue
            
            audit_data = {
                "user_id": audit.user_id if hasattr(g, "user") else None,
                "first_name": audit.first_name if hasattr(g, "user") else None,
                "last_name": audit.last_name if hasattr(g, "user") else None,
                "pfs_num": audit.pfs_num if hasattr(g, "user") else None,
                "user_email": audit.user_email if hasattr(g, "user") else None,
                "event": audit.event,
                'auditable_id': audit.auditable_id,
                'old_values': audit.old_values,
                'new_values': audit.new_values,
                'url': audit.url,
                'ip_address': audit.ip_address,
                'user_agent': audit.user_agent,
                'tags': audit.tags,
                'created_at': audit.created_at,
                'updated_at': audit.updated_at
            }
            audit_list.append(audit_data)

        # Log the audit event for listing audit logs
        current_time = datetime.utcnow()
        audit_log_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "list_audit_log",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Audit",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_log_data)
        publish_to_rabbitmq(serialized_data)

        response = {
            "status": "success",
            "status_code": 200,
            "audit": audit_list,
            "total_pages": audits.pages,
            "current_page": audits.page,
            "total_items": audits.total,
        }
    
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of audits: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_audit(audit_id):
    audit = Audit.query.get_or_404(audit_id)
    audit_data = {
        "user_id": audit.user_id if hasattr(g, "user") else None,
        "first_name": audit.first_name if hasattr(g, "user") else None,
        "last_name": audit.last_name if hasattr(g, "user") else None,
        "pfs_num": audit.pfs_num if hasattr(g, "user") else None,
        "user_email": audit.user_email if hasattr(g, "user") else None,
        "event": audit.event,
        'auditable_id': audit.auditable_id,
        'old_values': audit.old_values,
        'new_values': audit.new_values,
        'url': audit.url,
        'ip_address': audit.ip_address,
        'user_agent': audit.user_agent,
        'tags': audit.tags,
        'created_at': audit.created_at,
        'updated_at': audit.updated_at
    }
    return jsonify(audit_data), 200
