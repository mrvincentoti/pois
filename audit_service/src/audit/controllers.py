from operator import and_

from flask import request, jsonify, g
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import or_, func, exists, desc

from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import custom_jwt_required
import redis
from sqlalchemy.orm import joinedload
import json
from .. import db
from .models import Audit
from .models import Employee
from ..util import decrypt, encrypt

def get_employee_name(employee_id):
    employee = Employee.query.filter_by(
        employee_id=employee_id).first()
    return employee.first_name + " " + employee.last_name + " " + employee.middle_name if hasattr(employee, "employee_id") else None

@custom_jwt_required
def get_all_audits():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)
        from_date_str = request.args.get('from_date', default=None, type=str)
        to_date_str = request.args.get('to_date', default=None, type=str)
        module = request.args.get('module', default=None, type=str)

        audit_query = Audit.query
        audit_query = audit_query.order_by(desc(Audit.created_at))

        if from_date_str and to_date_str:
            from_date = datetime.strptime(from_date_str, "%Y-%m-%d")
            to_date = datetime.strptime(to_date_str, "%Y-%m-%d")
            audit_query = audit_query.filter(and_(Audit.updated_at >= from_date, Audit.updated_at <= to_date))

        # Filter by module tag
        if module:
            encrypted_module = encrypt(module)
            audit_query = audit_query.filter(Audit.tags.like(f"%{encrypted_module}%"))

        # Fetch and decrypt results before filtering by search_term
        audits = audit_query.paginate(page=page, per_page=per_page)
        audit_list = []

        for audit in audits.items:
            decrypted_event = decrypt(audit.event)
            decrypted_tags = decrypt(audit.tags)
            decrypted_old_values = decrypt(audit.old_values)
            decrypted_new_values = decrypt(audit.new_values)
            decrypted_url = decrypt(audit.url)
            decrypted_ip_address = decrypt(audit.ip_address)
            decrypted_user_agent = decrypt(audit.user_agent)

            # Apply search filter after decryption
            if search_term:
                if not any(search_term.lower() in field.lower() for field in [
                    decrypted_event, decrypted_tags, decrypted_old_values, decrypted_new_values, decrypted_url, decrypted_ip_address, decrypted_user_agent
                ]):
                    continue

            audit_data = {
                'id': audit.id,
                'user_id': audit.user_id,
                'event': decrypted_event,
                'employee_id': audit.employee_id if hasattr(audit, "employee_id") else None,
                'employee': get_employee_name(audit.employee_id),

                'last_name': decrypt(audit.last_name) if audit.last_name else None,
                'first_name': decrypt(audit.first_name) if audit.first_name else None,
                'pfs_num': decrypt(audit.pfs_num) if audit.pfs_num else None,

                'auditable_id': audit.auditable_id,
                'old_values': decrypted_old_values,
                'new_values': decrypted_new_values,
                'url': decrypted_url,
                'ip_address': decrypted_ip_address,
                'user_agent': decrypted_user_agent,
                'tags': decrypted_tags,
                'created_at': audit.created_at,
                'updated_at': audit.updated_at
            }
            audit_list.append(audit_data)
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_audit_log"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Audit"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
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
        'id': audit.id,
        'user_id': audit.user_id,
        'event': audit.event,
        'employee_id': audit.employee_id,
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


@custom_jwt_required
def filter_audit():
    try:
        page = int(request.args.get('page', 1))
        per_page = request.args.get('per_page', default=10, type=int)
        query = Audit.query

        # Filtering by date_created
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date and end_date:
            start_date = datetime.strptime(
                start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(
                end_date, '%Y-%m-%d').date()
            query = query.filter(
                Audit.created_at.between(
                    start_date, end_date)
            )
        elif start_date:
            start_date = datetime.strptime(
                start_date, '%Y-%m-%d').date()
            query = query.filter(Audit.created_at >=
                                 start_date)
        elif end_date:
            end_date = datetime.strptime(
                end_date, '%Y-%m-%d').date()
            query = query.filter(Audit.created_at <=
                                 end_date)
        
        audits = query.paginate(page=page, per_page=per_page)
        audit_list = []
        for audit in audits:
            audit_data = {
                'id': audit.id,
                'user_id': audit.user_id,
                'event': audit.event,
                'employee_id': audit.employee_id,
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