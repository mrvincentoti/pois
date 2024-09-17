# nok/controllers.py
import json
from datetime import datetime
from flask import request, jsonify, g
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm.exc import NoResultFound
from .. import db
from .models import NextOfKin
from ..employee.models import Employee
from ..redis_manager import custom_jwt_required
from sqlalchemy import or_
from ..rabbitmq_manager import publish_to_rabbitmq
import pandas as pd

from ..util import encrypt, decrypt


def get_employee_id(pf_number):
    employees = Employee.query.all()

    for employee in employees:
        decrypted_pf_num = decrypt(employee.pf_num)

        if decrypted_pf_num == pf_number:
            return employee.id

    return None


@custom_jwt_required
def add_next_of_kin(employee_id):
    try:
        data = request.get_json()

        # Extract data from the request
        firstname = data.get("firstname")
        lastname = data.get("lastname")
        email = data.get("email")
        phone = data.get("phone")
        address = data.get("address")
        relationship = data.get("relationship")
        category_id = data.get("category_id")

        if not firstname or not lastname:
            return jsonify({"message": "First name and last name are required"}), 400

        # Check if the associated employee exists
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({"message": "Employee not found"}), 404

        # Check if the employee already has a Next of Kin
        existing_nok = NextOfKin.query.filter_by(
            employee_id=employee_id, category_id=category_id, deleted_at=None
        ).first()
        if existing_nok:
            return jsonify({"message": "Employee already has a Next of Kin"}), 400

        # Create a new NextOfKin instance
        new_nok = NextOfKin(
            firstname=firstname,
            lastname=lastname,
            email=email,
            phone=phone,
            address=address,
            relationship=relationship,
            employee_id=employee_id,
            category_id=category_id
        )

        db.session.add(new_nok)
        db.session.commit()

        # Audit
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("add_next_of_kin"),
            "auditable_id": new_nok.id,
            "old_values": None,
            "new_values": encrypt(json.dumps(
                {
                    "firstname": firstname,
                    "lastname": lastname,
                    "email": email,
                    "phone": phone,
                    "address": address,
                    "relationship": relationship,
                }
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, NextOfKin"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        return jsonify({"message": "Next of Kin added successfully"}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Error adding Next of Kin", "error": str(e)}), 500

    finally:
        db.session.close()


@custom_jwt_required
def list_noks(employee_id):
    try:
        # Get query parameters for pagination and search
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)
        search_term = request.args.get("q", default="", type=str)

        # Check if the associated employee exists
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({"message": "Employee not found"}), 404

        # Build the base query for NextOfKin
        base_query = NextOfKin.query.filter_by(employee_id=employee_id, deleted_at=None)

        # Apply search filter if a search term is provided
        if search_term:
            base_query = base_query.filter(
                or_(
                    NextOfKin.firstname.ilike(f"%{search_term}%"),
                    NextOfKin.lastname.ilike(f"%{search_term}%"),
                    NextOfKin.email.ilike(f"%{search_term}%"),
                    NextOfKin.phone.ilike(f"%{search_term}%"),
                    NextOfKin.address.ilike(f"%{search_term}%"),
                    NextOfKin.relationship.ilike(f"%{search_term}%"),
                )
            )

        # Paginate the filtered NextOfKin query
        noks_paginated = base_query.paginate(page=page, per_page=per_page)

        nok_list = []
        for nok in noks_paginated.items:
            nok_data = nok.to_dict()
            nok_list.append(nok_data)

        response = {
            "status": "success",
            "status_code": 200,
            "next_of_kin": nok_list,
            "total_pages": noks_paginated.pages,
            "current_page": noks_paginated.page,
            "total_items": noks_paginated.total,
        }

        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("view_nok"),
            "auditable_id": nok.id,
            "old_values": encrypt(json.dumps(
                {
                    "firstname": nok.firstname,
                    "lastname": nok.lastname,
                    "email": nok.email,
                    "phone": nok.phone,
                    "address": nok.address,
                    "relationship": nok.relationship,
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, NextOfKin"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of Next of Kin: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def list_employee_noks():
    try:
        # Get query parameters for pagination and search
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)
        search_term = request.args.get("q", default="", type=str)

        # Build the base query for NextOfKin
        base_query = NextOfKin.query.filter_by(deleted_at=None)
        # Paginate the filtered NextOfKin query
        noks_paginated = base_query.paginate(page=page, per_page=per_page)

        nok_list = []
        for nok in noks_paginated.items:
            nok_data = nok.to_dict()
            if search_term:
                search_pattern = search_term.lower()

                first_name = nok_data['employee']['first_name'].lower()
                last_name = nok_data['employee']['last_name'].lower()
                pf_number = nok_data['employee']['pf_num'].lower()

                # Check if the search pattern is in any of the fields
                if (search_pattern in first_name or
                        search_pattern in last_name or
                        search_pattern in pf_number):
                    nok_list.append(nok_data)
            else:
                # If no search term, just add the employee data
                nok_list.append(nok_data)
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_employee_nok"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, NextOfKin"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        response = {
            "status": "success",
            "status_code": 200,
            "next_of_kin": nok_list,
            "total_pages": noks_paginated.pages,
            "current_page": noks_paginated.page,
            "total_items": noks_paginated.total,
        }
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of Next of Kin: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_nok(nok_id):
    try:
        nok = NextOfKin.query.filter_by(id=nok_id, deleted_at=None).first()

        if nok:
            nok_data = nok.to_dict()
            return jsonify({"next_of_kin": nok_data})
        else:
            return jsonify({"message": "Next of Kin not found"}), 404

    except SQLAlchemyError as e:
        return (
            jsonify(
                {"message": "Error retrieving Next of Kin details", "error": str(e)}
            ),
            500,
        )


@custom_jwt_required
def update_nok(nok_id):
    try:
        nok = NextOfKin.query.filter_by(id=nok_id, deleted_at=None).first()

        if not nok:
            return jsonify({"message": "Next of Kin not found"}), 404

        old_values = {
            "firstname": nok.firstname,
            "lastname": nok.lastname,
            "email": nok.email,
            "phone": nok.phone,
            "address": nok.address,
            "relationship": nok.relationship,
        }

        data = request.get_json()

        nok.update(
            firstname=data.get('firstname'),
            lastname=data.get('lastname'),
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address'),
            relationship=data.get('relationship'),
            category_id=data.get('category_id')
        )

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("update_nok"),
            "auditable_id": nok.id,
            "old_values": encrypt(json.dumps(old_values)),
            "new_values": encrypt(json.dumps(
                {
                    "firstname": nok.firstname,
                    "lastname": nok.lastname,
                    "email": nok.email,
                    "phone": nok.phone,
                    "address": nok.address,
                    "relationship": nok.relationship,
                }
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, NextOfKin"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        return jsonify({"message": "Next of Kin updated successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return (
            jsonify({"message": "Error updating Next of Kin details", "error": str(e)}),
            500,
        )

    finally:
        db.session.close()


@custom_jwt_required
def delete_nok(nok_id):
    try:
        nok = NextOfKin.query.filter_by(id=nok_id, deleted_at=None).first()

        if not nok:
            return jsonify({"message": "Next of Kin not found"}), 404

        nok.soft_delete()
        db.session.commit()

        # Audit - Record before deletion
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": "delete_nok",
            "auditable_id": nok.id,
            "old_values": encrypt(json.dumps(
                {
                    "firstname": nok.firstname,
                    "lastname": nok.lastname,
                    "email": nok.email,
                    "phone": nok.phone,
                    "address": nok.address,
                    "relationship": nok.relationship,
                }
            )),
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, NextOfKin"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        return jsonify({"message": "Next of Kin deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting Next of Kin", "error": str(e)}), 500

    finally:
        db.session.close()


@custom_jwt_required
def restore_nok(nok_id):
    nok = NextOfKin.query.filter_by(id=nok_id).first()

    if nok is None:
        return jsonify({"message": "Next of Kin not found"}), 404

    try:
        nok.restore()
        db.session.commit()
        return jsonify({"message": "Next of Kin restored successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring Next of Kin", "error": str(e)}), 500
    finally:
        db.session.close()


def bulk_upload_nok():
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
                selected_columns = ['FIRST_NAME', 'LAST_NAME', 'RELATIONSHIP']
                empty_rows_data = empty_rows[selected_columns].reset_index().rename(columns={
                    'index': 'row_number'})

                empty_rows_data['row_number'] += 2
                empty_rows_data = empty_rows_data.to_dict(orient='records')

                return jsonify({
                    "error": f"The column PF NUMBER is empty for the following rows:",
                    "rows": empty_rows_data
                }), 500

            success_count = 0
            for index, row in df.iterrows():
                row = row.where(pd.notna(row), None)
                employee_id = get_employee_id(str(row['PF_NUM']))

                try:
                    new_nok = NextOfKin(
                        employee_id=employee_id,
                        firstname=row['FIRSTNAME'],
                        lastname=row['LASTNAME'],
                        email=row['EMAIL'],
                        phone=str(row['PHONE']),
                        address=row['ADDRESS'],
                        relationship=row['RELATIONSHIP'],
                        category_id=row['CATEGORY_ID'],
                    )

                    db.session.add(new_nok)
                    success_count += 1

                    db.session.commit()
                except Exception as e:
                    db.session.rollback()
                    return jsonify({'error': 'Error adding employee', 'error': str(e)}), 500
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
                    "event": encrypt("bulk_upload_nok"),
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
