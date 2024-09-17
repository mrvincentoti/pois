from flask import request, jsonify, g
import uuid
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.sql import text

from ..country.models import Country
from ..employee.models import Employee
from ..redis_manager import custom_jwt_required
from ..rabbitmq_manager import publish_to_rabbitmq
import redis
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload, aliased
from sqlalchemy import or_, and_, asc, func, select
from datetime import date
import pandas as pd

from .. import db
from .models import EmployeePosting
from ..region.models import Region
from ..station.models import Station
from ..util import decrypt, encrypt


def get_employee_id(pf_number):
    employees = Employee.query.all()

    for employee in employees:
        decrypted_pf_num = decrypt(employee.pf_num)

        if decrypted_pf_num == pf_number:
            return employee.id

    return None


def get_posting_children(posting_id):
    children_list = []
    postings = EmployeePosting.query.filter_by(
        parent_id=posting_id).order_by(EmployeePosting.id.asc())

    for posting in postings:
        employee_data = Employee.query.filter_by(id=posting.employee_id).first()
        region_data = Region.query.filter_by(id=posting.region_id).first()
        station_data = Station.query.filter_by(id=posting.station_id).first()
        country_data = Country.query.filter_by(id=station_data.country_id).first()

        children_data = {
            'id': posting.id,
            'employee': {
                'id': employee_data.id,
                'first_name': employee_data.first_name,
                'last_name': employee_data.last_name,
                'pf_num': employee_data.pf_num,
            },
            'region': {
                'id': region_data.id,
                'name': region_data.name,
            },
            'station': {
                'id': station_data.id,
                'name': station_data.name,
                'country': country_data.en_short_name
            },
            'designation_at_post': posting.designation_at_post,
            'assumption_date': posting.assumption_date.strftime('%Y-%m-%d'),
            'expected_date_of_return': posting.expected_date_of_return.strftime(
                '%Y-%m-%d') if posting.expected_date_of_return else None,
            'date_of_return': posting.date_of_return.strftime(
                '%Y-%m-%d') if posting.date_of_return else None,
            'status': posting.status,
            'deleted_at': posting.deleted_at.strftime('%Y-%m-%d') if posting.deleted_at else None,
            'posting_type': posting.posting_type if posting.posting_type else None,
            'parent_id': posting.parent_id if posting.parent_id else None,
            'is_extended': check_posting_extension(posting.id),
            'reason': posting.reason if posting.reason else None,
            'is_recall': check_recall(posting.id),
        }
        children_list.append(children_data)

    return children_list


def check_posting_extension(posting_id):
    posting = EmployeePosting.query.filter_by(parent_id=posting_id).first()
    if posting:
        return True
    else:
        return False


def check_recall(posting_id):
    posting = EmployeePosting.query.filter_by(id=posting_id, posting_type=2).first()
    if posting:
        return True
    else:
        return False


@custom_jwt_required
def add_employee_posting():
    try:
        data = request.get_json()
        employee_id = data.get('employee_id')
        region_id = data.get('region_id')
        station_id = data.get('station_id')
        designation_at_post = data.get('designation_at_post')
        expected_date_of_return = data.get('expected_date_of_return')
        assumption_date = data.get('assumption_date')
        date_of_return = data.get('date_of_return')
        status = data.get('status')
        posting_type = data.get('posting_type')

        # Check if the employee is currently posted within the specified date range
        current_posting = (
            EmployeePosting.query.filter(
                EmployeePosting.employee_id == employee_id,
                EmployeePosting.assumption_date <= assumption_date,
                EmployeePosting.date_of_return >= assumption_date,
                EmployeePosting.status == 1
            )
            .first()
        )

        if current_posting:
            return jsonify({'error': 'Employee is currently posted.'}), 400

        new_posting = EmployeePosting(
            employee_id=employee_id,
            region_id=region_id,
            station_id=station_id,
            designation_at_post=designation_at_post,
            assumption_date=assumption_date,
            expected_date_of_return=expected_date_of_return,
            date_of_return=date_of_return,
            status=status,
            posting_type=posting_type
        )

        db.session.add(new_posting)
        db.session.commit()

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("add_employee_posting"),
            "auditable_id": new_posting.id,
            "old_values": None,
            "new_values": encrypt(json.dumps(
                {
                    "id": new_posting.id,
                    'employee_id': new_posting.employee_id,
                    'region_id': new_posting.region_id,
                    'station_id': new_posting.station_id,
                    'designation_at_post': new_posting.designation_at_post,
                    'assumption_date': str(new_posting.assumption_date),
                    'expected_date_of_return': str(new_posting.expected_date_of_return),
                    'date_of_return': str(new_posting.date_of_return),
                    'status': new_posting.status,
                }
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, Posting"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Employee posting added successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 201

    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def get_employee_postings():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get("q", default="", type=str)

        offset = (page - 1) * per_page

        # Subquery to select the most recent entry for each employee based on the id field
        recent_entries_subquery = db.session.query(
            func.max(EmployeePosting.id).label('max_id')
        ).filter(EmployeePosting.deleted_at == None).group_by(EmployeePosting.employee_id).subquery()

        # Query to fetch the most recent entry for each employee
        base_query = db.session.query(EmployeePosting).join(
            recent_entries_subquery,
            EmployeePosting.id == recent_entries_subquery.c.max_id
        )

        expected_start_date = request.args.get('expected_date_of_return_start_date')
        expected_end_date = request.args.get('expected_date_of_return_end_date')

        if expected_start_date and expected_end_date:
            expected_start_date = datetime.strptime(expected_start_date, '%Y-%m-%d').date()
            expected_end_date = datetime.strptime(expected_end_date, '%Y-%m-%d').date()
            base_query = base_query.filter(
                EmployeePosting.expected_date_of_return.between(expected_start_date, expected_end_date)
            )
        elif expected_start_date:
            expected_start_date = datetime.strptime(expected_start_date, '%Y-%m-%d').date()
            base_query = base_query.filter(
                EmployeePosting.expected_date_of_return >= expected_start_date)
        elif expected_end_date:
            expected_end_date = datetime.strptime(expected_end_date, '%Y-%m-%d').date()
            base_query = base_query.filter(
                EmployeePosting.expected_date_of_return <= expected_end_date)

        # Filtering by assumption_date
        assumption_start_date = request.args.get('assumption_date_start_date')
        assumption_end_date = request.args.get('assumption_date_end_date')

        if assumption_start_date and assumption_end_date:
            assumption_start_date = datetime.strptime(assumption_start_date, '%Y-%m-%d').date()
            assumption_end_date = datetime.strptime(assumption_end_date, '%Y-%m-%d').date()
            base_query = base_query.filter(
                EmployeePosting.assumption_date.between(assumption_start_date, assumption_end_date)
            )
        elif assumption_start_date:
            assumption_start_date = datetime.strptime(assumption_start_date, '%Y-%m-%d').date()
            base_query = base_query.filter(
                EmployeePosting.assumption_date >= assumption_start_date)
        elif assumption_end_date:
            assumption_end_date = datetime.strptime(assumption_end_date, '%Y-%m-%d').date()
            base_query = base_query.filter(
                EmployeePosting.assumption_date <= assumption_end_date)

        # Filtering by date_of_return
        return_start_date = request.args.get('date_of_return_start_date')
        return_end_date = request.args.get('date_of_return_end_date')

        if return_start_date and return_end_date:
            return_start_date = datetime.strptime(return_start_date, '%Y-%m-%d').date()
            return_end_date = datetime.strptime(return_end_date, '%Y-%m-%d').date()
            base_query = base_query.filter(
                EmployeePosting.date_of_return.between(return_start_date, return_end_date)
            )
        elif return_start_date:
            return_start_date = datetime.strptime(return_start_date, '%Y-%m-%d').date()
            base_query = base_query.filter(
                EmployeePosting.date_of_return >= return_start_date)
        elif return_end_date:
            return_end_date = datetime.strptime(return_end_date, '%Y-%m-%d').date()
            base_query = base_query.filter(
                EmployeePosting.date_of_return <= return_end_date)

        # Filtering by dropdown values
        employee_id = request.args.get('employee_id')
        # rank_id = request.args.get('rank_id')
        country_id = request.args.get('country_id')
        region_id = request.args.get('region_id')
        station_id = request.args.get('station_id')
        posting_type = request.args.get('posting_type')

        if employee_id:
            base_query = base_query.filter(
                EmployeePosting.employee_id == employee_id)

        # if rank_id:
        #     query = query.filter(EmployeePosting.rank_id == rank_id)

        if country_id:
            base_query = base_query.filter(
                EmployeePosting.country_id == country_id)

        if region_id:
            base_query = base_query.filter(
                EmployeePosting.region_id == region_id)

        if station_id:
            base_query = base_query.filter(
                EmployeePosting.station_id == station_id)

        if posting_type:
            base_query = base_query.filter(
                EmployeePosting.posting_type == posting_type)

        total_items = base_query.count()

        employee_postings = base_query.offset(offset).limit(per_page).all()

        employee_posting_list = []

        for emp_posting in employee_postings:
            employee_data = Employee.query.filter_by(id=emp_posting.employee_id).first()
            region_data = Region.query.filter_by(id=emp_posting.region_id).first()
            station_data = Station.query.filter_by(id=emp_posting.station_id).first()
            country_data = Country.query.filter_by(id=station_data.country_id).first()

            if employee_data and region_data and station_data:
                posting_data = emp_posting.to_dict()

                if search_term:
                    search_pattern = search_term.lower()

                    first_name = posting_data['employee']['first_name'].lower()
                    last_name = posting_data['employee']['last_name'].lower()
                    pf_number = posting_data['employee']['pf_num'].lower()

                    # Check if the search pattern is in any of the fields
                    if (search_pattern in first_name or
                            search_pattern in last_name or
                            search_pattern in pf_number):
                        employee_posting_list.append(posting_data)
                else:
                    # If no search term, just add the employee data
                    employee_posting_list.append(posting_data)

        total_pages = (total_items + per_page - 1) // per_page

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_employee_posting"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, Posting"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response = {
            "status": "success",
            "status_code": 200,
            "postings": employee_posting_list,
            "total_pages": total_pages,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of employee postings: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_employee_posting(posting_id):
    try:
        posting = EmployeePosting.query \
            .filter_by(id=posting_id) \
            .join(EmployeePosting.employee) \
            .join(EmployeePosting.region) \
            .join(EmployeePosting.station) \
            .first()

        if not posting:
            return jsonify({'error': 'Employee posting not found'})

        posting_data = {
            'id': posting.id,
            'employee_id': posting.employee_id,
            'employee_name': posting.employee.first_name[0].upper() + "." + posting.employee.middle_name[
                0].upper() + " " + posting.employee.first_name,
            'region_id': posting.region_id,
            'region_name': posting.region.name,
            'station_id': posting.station_id,
            'station_name': posting.station.name,
            'designation_at_post': posting.designation_at_post,
            'assumption_date': str(posting.assumption_date) if posting.assumption_date else None,
            'expected_date_of_return': str(
                posting.expected_date_of_return) if posting.expected_date_of_return else None,
            'date_of_return': str(posting.date_of_return) if posting.date_of_return else None,
            'status': posting.status,
            'deleted_at': posting.deleted_at,
            'posting_type': posting.posting_type if posting.posting_type else None,
            'parent_id': posting.parent_id if posting.parent_id else None,
        }

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("view_employee_posting"),
            "auditable_id": posting.id,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, Posting"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({'employee_posting': posting_data})
    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def update_employee_posting(posting_id):
    try:
        posting = EmployeePosting.query.get(posting_id)

        if not posting:
            return jsonify({'error': 'Employee posting not found'})

        old_values = json.dumps(
            {
                "id": posting.id,
                'employee_id': posting.employee_id,
                'region_id': posting.region_id,
                'station_id': posting.station_id,
                'designation_at_post': posting.designation_at_post,
                'assumption_date': str(posting.assumption_date),
                'expected_date_of_return': str(posting.expected_date_of_return),
                'date_of_return': str(posting.date_of_return),
                'status': posting.status,
            }
        )
        # Check if the updated posting dates and status are valid
        assumption_date = request.json.get('assumption_date', posting.assumption_date)
        date_of_return = request.json.get('date_of_return', posting.date_of_return)
        status = request.json.get('status', posting.status)

        # Check if the employee is currently posted within the specified date range
        current_posting = (
            EmployeePosting.query.filter(
                EmployeePosting.employee_id == posting.employee_id,
                EmployeePosting.assumption_date <= assumption_date,
                EmployeePosting.date_of_return >= assumption_date,
                EmployeePosting.status == 1  # Assuming 1 represents an active status
            )
            .filter(EmployeePosting.id != posting_id)  # Exclude the current posting from the check
            .first()
        )

        if current_posting:
            return jsonify({'error': 'Employee is currently posted.'}), 400

        # Update the posting details
        employee_id = request.json.get('employee_id', posting.employee_id)
        region_id = request.json.get('region_id', posting.region_id)
        station_id = request.json.get('station_id', posting.station_id)
        designation_at_post = request.json.get('designation_at_post', posting.designation_at_post)
        assumption_date = assumption_date
        expected_date_of_return = request.json.get('expected_date_of_return', posting.expected_date_of_return)
        date_of_return = date_of_return
        status = status

        posting.update(employee_id=employee_id, region_id=region_id,
                       expected_date_of_return=expected_date_of_return, station_id=station_id,
                       designation_at_post=designation_at_post, assumption_date=assumption_date,
                       date_of_return=date_of_return, status=status)

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_employee_posting"),
            "auditable_id": posting.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {
                    "id": posting.id,
                    'employee_id': posting.employee_id,
                    'region_id': posting.region_id,
                    'station_id': posting.station_id,
                    'designation_at_post': posting.designation_at_post,
                    'assumption_date': str(posting.assumption_date),
                    'expected_date_of_return': str(posting.expected_date_of_return),
                    'date_of_return': str(posting.date_of_return),
                    'status': posting.status,
                }
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, Posting"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response_data = {
            "message": "Employee posting updated successfully",
            "audit": audit_data,
        }
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def get_postings_for_employee(employee_id):
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)

        offset = (page - 1) * per_page

        postings = EmployeePosting.query \
            .filter_by(employee_id=employee_id) \
            .join(EmployeePosting.employee) \
            .join(EmployeePosting.region) \
            .join(EmployeePosting.station) \
            .offset(offset) \
            .limit(per_page) \
            .all()

        total_items = EmployeePosting.query.filter_by(employee_id=employee_id).count()

        if not postings:
            return jsonify({'message': 'No employee postings found for this employee'})

        postings_list = []
        for posting in postings:
            posting_data = posting.to_dict()
            postings_list.append(posting_data)

        total_pages = (total_items + per_page - 1) // per_page

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("view_employee_posting"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, Posting"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response = {
            "status": "success",
            "status_code": 200,
            "postings": postings_list,
            "total_pages": total_pages,
            "current_page": page,
            "total_items": total_items,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of employee postings: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def filter_employee_postings():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)

        query = EmployeePosting.query
        paginated_query = query.paginate(page=page, per_page=per_page)
        # Filtering by expected_date_of_return
        expected_start_date = request.args.get('expected_date_of_return_start_date')
        expected_end_date = request.args.get('expected_date_of_return_end_date')

        if expected_start_date and expected_end_date:
            expected_start_date = datetime.strptime(expected_start_date, '%Y-%m-%d').date()
            expected_end_date = datetime.strptime(expected_end_date, '%Y-%m-%d').date()
            query = query.filter(
                EmployeePosting.expected_date_of_return.between(expected_start_date, expected_end_date)
            )
        elif expected_start_date:
            expected_start_date = datetime.strptime(expected_start_date, '%Y-%m-%d').date()
            query = query.filter(EmployeePosting.expected_date_of_return >= expected_start_date)
        elif expected_end_date:
            expected_end_date = datetime.strptime(expected_end_date, '%Y-%m-%d').date()
            query = query.filter(EmployeePosting.expected_date_of_return <= expected_end_date)

        # Filtering by assumption_date
        assumption_start_date = request.args.get('assumption_date_start_date')
        assumption_end_date = request.args.get('assumption_date_end_date')

        if assumption_start_date and assumption_end_date:
            assumption_start_date = datetime.strptime(assumption_start_date, '%Y-%m-%d').date()
            assumption_end_date = datetime.strptime(assumption_end_date, '%Y-%m-%d').date()
            query = query.filter(
                EmployeePosting.assumption_date.between(assumption_start_date, assumption_end_date)
            )
        elif assumption_start_date:
            assumption_start_date = datetime.strptime(assumption_start_date, '%Y-%m-%d').date()
            query = query.filter(EmployeePosting.assumption_date >= assumption_start_date)
        elif assumption_end_date:
            assumption_end_date = datetime.strptime(assumption_end_date, '%Y-%m-%d').date()
            query = query.filter(EmployeePosting.assumption_date <= assumption_end_date)

        # Filtering by date_of_return
        return_start_date = request.args.get('date_of_return_start_date')
        return_end_date = request.args.get('date_of_return_end_date')

        if return_start_date and return_end_date:
            return_start_date = datetime.strptime(return_start_date, '%Y-%m-%d').date()
            return_end_date = datetime.strptime(return_end_date, '%Y-%m-%d').date()
            query = query.filter(
                EmployeePosting.date_of_return.between(return_start_date, return_end_date)
            )
        elif return_start_date:
            return_start_date = datetime.strptime(return_start_date, '%Y-%m-%d').date()
            query = query.filter(EmployeePosting.date_of_return >= return_start_date)
        elif return_end_date:
            return_end_date = datetime.strptime(return_end_date, '%Y-%m-%d').date()
            query = query.filter(EmployeePosting.date_of_return <= return_end_date)

        # Filtering by dropdown values
        employee_id = request.args.get('employee_id')
        # rank_id = request.args.get('rank_id')
        country_id = request.args.get('country_id')
        region_id = request.args.get('region_id')
        station_id = request.args.get('station_id')
        posting_type = request.args.get('posting_type')

        if employee_id:
            query = query.filter(EmployeePosting.employee_id == employee_id)

        # if rank_id:
        #     query = query.filter(EmployeePosting.rank_id == rank_id)

        if country_id:
            query = query.filter(EmployeePosting.country_id == country_id)

        if region_id:
            query = query.filter(EmployeePosting.region_id == region_id)

        if station_id:
            query = query.filter(EmployeePosting.station_id == station_id)

        if posting_type:
            query = query.filter(EmployeePosting.posting_type == posting_type)

        # Execute the query
        filtered_postings = query.all()

        # Convert the results to a JSON response
        serialized_postings = [
            posting.to_dict()
            for posting in filtered_postings
        ]

        # Destructure pagination details
        total_pages = paginated_query.pages
        current_page = paginated_query.page
        items_per_page = paginated_query.per_page
        total_items = paginated_query.total

        response = {
            'current_page': current_page,
            'postings': serialized_postings,
            'status': 'success',
            'status_code': 200,
            'total_items': total_items,
            'total_pages': total_pages,
        }

        return jsonify(response)
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of postings: {str(e)}",
        }

        return jsonify(response), response["status_code"]


@custom_jwt_required
def delete_employee_posting(posting_id):
    posting = EmployeePosting.query.filter_by(id=posting_id).first()

    if posting is None:
        return jsonify({'message': 'Employee Posting not found'}), 404

    try:
        posting.soft_delete()
        db.session.commit()

        # Audit - Record before deletion

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_employee_posting"),
            "auditable_id": posting.id,
            "old_values": encrypt(json.dumps(
                {
                    "id": posting.id,
                    'employee_id': posting.employee_id,
                    'region_id': posting.region_id,
                    'station_id': posting.station_id,
                    'designation_at_post': posting.designation_at_post,
                    'assumption_date': str(posting.assumption_date),
                    'expected_date_of_return': str(posting.expected_date_of_return),
                    'date_of_return': str(posting.date_of_return),
                    'status': posting.status,
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, EmployeePosting"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({'message': 'Employee-posting deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting employee posting', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_employee_posting(posting_id):
    posting = EmployeePosting.query.filter_by(id=posting_id).first()

    if posting is None:
        return jsonify({'message': 'Employee posting not found'}), 404

    try:
        posting.restore()
        db.session.commit()
        return jsonify({'message': 'Employee posting restored successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error restoring employee posting', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def posting_action(posting_id):
    posting = EmployeePosting.query.filter_by(id=posting_id).first()
    if posting is None:
        return jsonify({'message': 'Employee posting not found'}), 404

    action = request.json.get('action')
    reason = request.json.get('reason')
    # 1 = extend
    # 2 = recall
    # 3 = cross posting
    # 4 = end posting
    if action == 1:
        # take posting type
        # take new return date
        # take the entire posting (old)
        # create new posting with the collected data
        # return result
        posting_type = request.json.get('posting_type')
        expected_date_of_return = request.json.get('expected_date_of_return')
        parent_posting_id = posting.id
        employee_id = posting.employee_id
        region_id = posting.region_id
        station_id = posting.station_id
        designation_at_post = posting.designation_at_post
        assumption_date = posting.assumption_date

        # Check if the employee is currently posted within the specified date range

        employee_postings = (
            EmployeePosting.query.filter(
                EmployeePosting.employee_id == employee_id
            ).all()
        )

        current_posting = None
        for posting in employee_postings:
            decrypted_expected_return_date = decrypt(posting.expected_date_of_return)
            if decrypted_expected_return_date >= expected_date_of_return:
                current_posting = posting
                break

        if current_posting:
            return jsonify({'error': "Employee currently on posting"}), 400

        if check_posting_extension(parent_posting_id):
            return jsonify({'error': 'Posting already extended'}), 400

        posting.posting_type = 6

        db.session.commit()

        new_posting = EmployeePosting(
            employee_id=employee_id,
            region_id=region_id,
            station_id=station_id,
            designation_at_post=decrypt(designation_at_post),
            assumption_date=decrypt(assumption_date),
            expected_date_of_return=expected_date_of_return,
            posting_type=posting_type,
            parent_id=parent_posting_id,
            reason=reason
        )

        db.session.add(new_posting)
        db.session.commit()

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_employee_posting"),
            "auditable_id": posting.id,
            "old_values": None,
            "new_values": encrypt(json.dumps(
                {
                    "id": new_posting.id,
                    'employee_id': new_posting.employee_id,
                    'region_id': new_posting.region_id,
                    'station_id': new_posting.station_id,
                    'designation_at_post': new_posting.designation_at_post,
                    'assumption_date': str(new_posting.assumption_date),
                    'expected_date_of_return': str(new_posting.expected_date_of_return),
                    'date_of_return': str(new_posting.date_of_return),
                    'status': new_posting.status,
                    'parent_id': new_posting.parent_id,
                    'posting_type': new_posting.posting_type,
                    'reason': new_posting.reason,
                }
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, EmployeePosting"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        return jsonify({'message': 'Employee Posting extended successfully'}), 201
    elif action == 2:
        old_values = json.dumps(
            {
                "id": posting.id,
                'employee_id': posting.employee_id,
                'region_id': posting.region_id,
                'station_id': posting.station_id,
                'designation_at_post': posting.designation_at_post,
                'assumption_date': str(posting.assumption_date),
                'expected_date_of_return': str(posting.expected_date_of_return),
                'date_of_return': str(posting.date_of_return),
                'status': posting.status,
                'reason': posting.reason
            }
        )

        date_of_return = request.json.get('date_of_return')
        posting.date_of_return = encrypt(date_of_return)
        posting.reason = encrypt(reason)
        posting.status = 2
        posting.posting_type = 2
        db.session.commit()

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "event": "edit_employee_posting",
            "auditable_id": posting.id,
            "old_values": json.dumps(old_values),
            "new_values": json.dumps(
                {
                    "id": posting.id,
                    'employee_id': posting.employee_id,
                    'region_id': posting.region_id,
                    'station_id': posting.station_id,
                    'designation_at_post': posting.designation_at_post,
                    'assumption_date': str(posting.assumption_date),
                    'expected_date_of_return': str(posting.expected_date_of_return),
                    'date_of_return': str(posting.date_of_return),
                    'status': posting.status,
                    'reason': posting.reason
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Employee, employeePosting, Update",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        return jsonify({'message': 'Employee Posting recalled successfully'}), 201
    elif action == 3:
        current_date = datetime.now()
        data = request.get_json()
        employee_id = posting.employee_id
        region_id = data.get('region_id')
        station_id = data.get('station_id')
        designation_at_post = data.get('designation_at_post')
        expected_date_of_return = data.get('expected_date_of_return')
        assumption_date = data.get('assumption_date')
        reason = data.get('reason')
        posting_type = 3
        parent_posting_id = posting.id

        employee_postings = (
            EmployeePosting.query.filter(
                EmployeePosting.employee_id == employee_id
            ).all()
        )

        current_posting = None
        for posting in employee_postings:
            decrypted_assumption_date = decrypt(posting.assumption_date)
            if decrypted_assumption_date >= assumption_date:
                current_posting = posting
                break

        # if current_posting:
        #     return jsonify({'error': "Employee currently on posting"}), 400
        #
        # # Check if the employee is currently posted within the specified date range
        # current_posting = (
        #     EmployeePosting.query.filter(
        #         EmployeePosting.id == parent_posting_id,
        #         EmployeePosting.assumption_date >= assumption_date,
        #         datetime.strptime(assumption_date, "%Y-%m-%d") >= current_date
        #     )
        #     .first()
        # )

        if current_posting:
            return jsonify({'error': 'Employee is currently on post. Please select a new assumption date'}), 400

        new_posting = EmployeePosting(
            employee_id=employee_id,
            region_id=region_id,
            station_id=station_id,
            designation_at_post=designation_at_post,
            assumption_date=assumption_date,
            expected_date_of_return=expected_date_of_return,
            posting_type=posting_type,
            parent_id=parent_posting_id,
            reason=reason
        )

        posting.posting_type = 5
        db.session.add(posting)
        db.session.add(new_posting)
        db.session.commit()

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_employee_posting"),
            "auditable_id": new_posting.id,
            "old_values": None,
            "new_values": encrypt(json.dumps(
                {
                    "id": new_posting.id,
                    'employee_id': new_posting.employee_id,
                    'region_id': new_posting.region_id,
                    'station_id': new_posting.station_id,
                    'designation_at_post': new_posting.designation_at_post,
                    'assumption_date': str(new_posting.assumption_date),
                    'expected_date_of_return': str(new_posting.expected_date_of_return),
                    'date_of_return': str(new_posting.date_of_return),
                    'status': new_posting.status,
                    'posting_type': new_posting.posting_type,
                    'reason': new_posting.reason,
                    'parent_id': new_posting.parent_id
                }
            )),
            "url": request.url,
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, EmployeePosting"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({'message': 'Cross Posting successful'}), 201
    elif action == 4:
        date_of_return = request.json.get('date_of_return')
        reason = request.json.get('reason')
        old_values = json.dumps(
            {
                "id": posting.id,
                'employee_id': posting.employee_id,
                'region_id': posting.region_id,
                'station_id': posting.station_id,
                'designation_at_post': posting.designation_at_post,
                'assumption_date': str(posting.assumption_date),
                'expected_date_of_return': str(posting.expected_date_of_return),
                'date_of_return': str(posting.date_of_return),
                'status': posting.status,
                'reason': posting.reason
            }
        )

        new_values = json.dumps(
            {
                "id": posting.id,
                'employee_id': posting.employee_id,
                'region_id': posting.region_id,
                'station_id': posting.station_id,
                'designation_at_post': posting.designation_at_post,
                'assumption_date': str(posting.assumption_date),
                'expected_date_of_return': str(posting.expected_date_of_return),
                'date_of_return': date_of_return,
                'status': 2,
                'reason': reason
            }
        )

        posting.status = 2
        # posting.posting_type = 4
        posting.reason = encrypt(reason)
        posting.date_of_return = encrypt(date_of_return)
        db.session.commit()

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_employee_posting"),
            "auditable_id": posting.id,
            "old_values": encrypt(old_values),
            "new_values": encrypt(new_values),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, EmployeePosting"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({'message': 'Employee posting ended successfully'}), 201
    else:
        return jsonify({'error': 'No action selected'}), 400


@custom_jwt_required
def bulk_upload_posting():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        try:
            df = pd.read_excel(file)
            empty_rows = df[df["PF_NUM"].isnull()]
            if not empty_rows.empty:
                selected_columns = ['ASSUMPTION_DATE',
                                    'EXPECTED_DATE_OF_RETURN']
                empty_rows_data = empty_rows[selected_columns].reset_index().rename(columns={'index': 'row_number'})

                empty_rows_data['row_number'] += 2
                empty_rows_data = empty_rows_data.to_dict(orient='records')

                return jsonify({
                    "error": f"The column PF NUMBER is empty for the following rows:",
                    "rows": empty_rows_data
                }), 500

            success_count = 0
            for index, row in df.iterrows():
                row = row.where(pd.notna(row), None)
                employee_id = get_employee_id(row['PF_NUM'])

                try:
                    new_posting = EmployeePosting(
                        employee_id=employee_id,
                        region_id=row['REGION_ID'],
                        station_id=row['STATION_ID'],
                        designation_at_post=row['DESIGNATION_AT_POST'],
                        assumption_date=row['ASSUMPTION_DATE'],
                        expected_date_of_return=row['EXPECTED_DATE_OF_RETURN'],
                        date_of_return=row['DATE_OF_RETURN'],
                        status=row['STATUS_ID']
                    )

                    db.session.add(new_posting)
                    success_count += 1

                    db.session.commit()
                except Exception as e:
                    db.session.rollback()
                    return jsonify({'error': 'Error adding posting', 'error': str(e)}), 500
                finally:
                    db.session.close()

            current_time = datetime.utcnow()
            df_dict = df.applymap(lambda x: str(x) if isinstance(x, pd.Timestamp) else x).to_dict()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("bulk_upload_posting"),
                "auditable_id": None,
                "old_values": None,
                "new_values": encrypt(json.dumps(df_dict)),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Employee"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            response = {
                "status": "success",
                "status_code": 200,
                "success_count": success_count
            }
            return jsonify(response), response["status_code"]

        except Exception as e:
            return jsonify({'error': str(e)})
    else:
        return jsonify({'error': 'File not found'})


@custom_jwt_required
def returning_from_post_in_four_months():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)

        current_date = datetime.now()
        future_date = current_date + timedelta(days=4 * 30)
        days_to_future = (future_date - current_date).days
        four_months_from_now = current_date + timedelta(days=4 * 30)  # Assuming a month has 30 days

        posting_due_for_return = (
            EmployeePosting.query
            .options(joinedload(EmployeePosting.employee))
            .options(joinedload(EmployeePosting.region))
            .options(joinedload(EmployeePosting.station))
            .filter(
                func.datediff(four_months_from_now, EmployeePosting.expected_date_of_return) >= 0
            )
        )

        returning_posting = posting_due_for_return.paginate(page=page, per_page=per_page)

        due_for_return_posting = []

        for posting in returning_posting.items:
            posting_object = {
                'id': posting.id,
                'employee': {
                    'pf_num': posting.employee.pf_num,
                    'id': posting.employee.id,
                    'first_name': posting.employee.first_name,
                    'last_name': posting.employee.last_name,
                    'middle_name': posting.employee.middle_name,
                    'photo': posting.employee.photo
                },
                'region': {
                    'id': posting.region.id,
                    'name': posting.region.name,
                },
                'station': {
                    'id': posting.station.id,
                    'name': posting.station.name
                },
                'designation_at_post': posting.designation_at_post,
                'assumption_date': posting.assumption_date.strftime('%Y-%m-%d'),
                'expected_date_of_return': posting.expected_date_of_return.strftime(
                    '%Y-%m-%d') if posting.expected_date_of_return else None,
                'date_of_return': posting.date_of_return.strftime(
                    '%Y-%m-%d') if posting.date_of_return else None,
                'status': posting.status,
                'deleted_at': posting.deleted_at.strftime('%Y-%m-%d') if posting.deleted_at else None,
                'posting_type': posting.posting_type if posting.posting_type else None,
                'parent_id': posting.parent_id if posting.parent_id else None,
                'is_extended': check_posting_extension(posting.id),
                'reason': posting.reason if posting.reason else None,
                'is_recall': check_recall(posting.id),
                'children': get_posting_children(posting.id)
            }

            due_for_return_posting.append(posting_object)

        response = {
            "status": "success",
            "status_code": 200,
            "due_for_return_posting": due_for_return_posting,
            "total_pages": returning_posting.pages,
            "current_page": returning_posting.page,
            "total_items": returning_posting.total,
        }
        return jsonify(response), 200
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of users: {str(e)}",
        }
        return jsonify(response)
