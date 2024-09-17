from flask import request, jsonify, g
import uuid
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from ..redis_manager import custom_jwt_required
from ..rabbitmq_manager import publish_to_rabbitmq, publish_employee_to_rabbitmq
from ..util import calculate_age, encrypt, decrypt, get_app_encryption_key
from sqlalchemy import or_, func, exists
import redis
import json
import math
from datetime import datetime, timedelta
from faker import Faker
import random
import os
import pika
import pandas as pd
from sqlalchemy.orm import joinedload, aliased

fake = Faker()

from .. import db
from .models import Employee
from ..rank.models import Rank

from ..implication.models import Implication
from ..religion.models import Religion
from ..employeePosting.models import EmployeePosting
from ..cadre.models import Cadre
from ..nok.models import NextOfKin

rabbitmq_host = os.getenv('RABBITMQ_HOST')
rabbitmq_port = int(os.getenv('RABBITMQ_PORT', '5672'))
rabbitmq_user = os.getenv('RABBITMQ_USER')
rabbitmq_pass = os.getenv('RABBITMQ_PASS')
queue_name = os.getenv('QUEUE_NAME')
emp_queue_name = os.getenv('EMP_QUEUE_NAME')

redis_client = redis.StrictRedis(
    host='redis', port=6379, decode_responses=True)

current_date = datetime.now()


def get_retirement_date(emp_object):
    return emp_object['retirement_date']


def compare_dates(date_str):
    earliest_date = datetime.strptime(date_str, "%Y-%m-%d")
    if earliest_date < current_date:
        return 'Action Required'


def get_employee_rank_id(level, cadre_id):
    rank = Rank.query.filter_by(cadre_id=cadre_id, level=level).first()
    if rank:
        return rank.id
    else:
        return None


def get_cadre_name(cadre_id):
    cadre = Cadre.query.filter_by(id=cadre_id).first()
    if cadre.id == 1:
        return "OPS"
    elif cadre.id == 2:
        return "PRO"
    else:
        return "GEN"


def get_implication(implication_id):
    implication = Implication.query.filter_by(id=implication_id).first()
    return implication


def get_award(id):
    award = Award.query.filter_by(id=id).first()
    return award


def get_religion(religion_id):
    religion = Religion.query.filter_by(id=religion_id).first()
    if religion:
        return religion.name
    else:
        return None


def get_employee_promotion_date(emp):
    promotion_term = None
    emp_last_promotion = datetime.strptime(emp.last_promotion_date, '%Y-%m-%d')

    if emp.rank.level >= 15 and emp_last_promotion is not None:
        promotion_term = emp_last_promotion + timedelta(days=365 * 4)
    elif emp.rank.level < 15 and emp_last_promotion is not None:
        promotion_term = emp_last_promotion + timedelta(days=365.5 * 3)

    return promotion_term


def generate_email(pf_num, value=None):
    if value is None:
        concatenated_string = f"{pf_num}@eims.com"
        return concatenated_string
    else:
        return value


current_date = datetime.now()
future_date = current_date + timedelta(days=4 * 30)


def get_retirement_date(emp, current_date=current_date):
    sixty_years_check = emp.dob + timedelta(days=60 * 365.25)
    thirty_five_years_check = emp.date_of_appointment + \
                              timedelta(days=35 * 365.25)
    director_years_check = 0
    earliest = 0
    if (emp.rank.level == 17 and
            emp.last_promotion_date is not None):
        director_years_check = emp.last_promotion_date + \
                               timedelta(days=8 * 365.25)

    # sixty_years_check_ = datetime.strptime(sixty_years_check, "%Y-%m-%d")
    # thirty_five_years_check_ = datetime.strptime(thirty_five_years_check, "%Y-%m-%d")
    # director_years_check_ = datetime.strptime(director_years_check, "%Y-%m-%d")

    if director_years_check == 0:
        earliest = min(sixty_years_check, thirty_five_years_check)
    else:
        earliest = min(sixty_years_check, thirty_five_years_check,
                       director_years_check)

    return earliest.strftime("%Y-%m-%d")


def get_years_of_service(emp):
    date_of_emp = datetime.strptime(emp.date_of_employment, '%Y-%m-%d %H:%M:%S')
    years_in_service = (current_date - date_of_emp).days / 365
    return years_in_service


@custom_jwt_required
def add_employee():
    if request.method == 'POST':
        data = request.get_json()
        # Extract data from the request
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        middle_name = data.get('middle_name')
        pf_num = data.get('pf_num')
        dob = data.get('dob')
        date_of_appointment = data.get('date_of_appointment')
        date_of_employment = data.get('date_of_employment')
        gender_id = data.get('gender_id')
        state_id = data.get('state_id')
        lga_id = data.get('lga_id')
        directorate_id = data.get('directorate_id')
        department_id = data.get('department_id')
        unit_id = data.get('unit_id')
        religion_id = data.get('religion_id')
        rank_id = data.get('rank_id')
        designation_id = data.get('designation_id')
        specialty_id = data.get('specialty_id')
        cadre_id = data.get('cadre_id')
        email = generate_email(data.get('pf_num'), data.get('email'))
        photo = request.json.get('photo')
        marital_status = request.json.get('marital_status')
        home_town = request.json.get('home_town')
        residential_address = request.json.get('residential_address')
        passport_official = request.json.get('passport_official')
        passport_personal = request.json.get('passport_personal')
        passport_diplomatic = request.json.get('passport_diplomatic')
        phone = request.json.get('phone')

        grade_on_app = request.json.get('grade_on_app')
        year_of_grad = request.json.get('year_of_grad')
        confirmation_of_app = request.json.get('confirmation_of_app')
        qualification = request.json.get('qualification')
        category = request.json.get('category')
        language_spoken = request.json.get('language_spoken')

        if not first_name or not last_name or not pf_num or not dob or not date_of_appointment:
            return jsonify(
                {'message': 'first_name and last_name, pf number, dob, date of appointment are required'}), 400

        # Create a new Employee instance
        new_employee = Employee(
            first_name=first_name,
            last_name=last_name,
            middle_name=middle_name,
            pf_num=pf_num,
            dob=dob,
            date_of_appointment=date_of_appointment,
            last_promotion_date=date_of_appointment,
            photo=photo,
            marital_status=marital_status,
            home_town=home_town,
            residential_address=residential_address,
            passport_official=passport_official,
            passport_personal=passport_personal,
            passport_diplomatic=passport_diplomatic,
            date_of_employment=date_of_employment,
            gender_id=gender_id,
            state_id=state_id,
            lga_id=lga_id,
            religion_id=religion_id,
            directorate_id=directorate_id,
            cadre_id=cadre_id,
            department_id=department_id,
            unit_id=unit_id,
            rank_id=rank_id,
            designation_id=designation_id,
            specialty_id=specialty_id,
            email=email,
            phone=phone,
            category=category,
            grade_on_app=grade_on_app,
            year_of_grad=year_of_grad,
            confirmation_of_app=confirmation_of_app,
            qualification=qualification,
            language_spoken=language_spoken
        )

        # return jsonify({'message': str(new_employee)}), 201
        try:
            db.session.add(new_employee)
            db.session.commit()
            # payload = {
            #     "employee_id": new_employee.id,
            #     "email": email,
            #     "username": pf_num,
            #     "password": "password",
            #     "role_id": 1,
            # }
            # redis_client.publish("CREATE_USER_ACCOUNT", json.dumps(payload))

            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("add_employee"),
                "auditable_id": new_employee.id,
                "old_values": None,
                "new_values": encrypt(json.dumps(
                    {
                        "first_name": first_name,
                        "last_name": last_name,
                        "middle_name": middle_name,
                        "pf_num": pf_num,
                        "dob": str(dob),
                        "date_of_appointment": str(date_of_appointment),
                        "date_of_employment": str(date_of_employment),
                        "gender_id": gender_id,
                        "state_id": state_id,
                        "lga_id": lga_id,
                        "photo": photo,
                        "directorate_id": directorate_id,
                        "department_id": department_id,
                        "unit_id": unit_id,
                        "religion_id": religion_id,
                        "rank_id": rank_id,
                        "designation_id": designation_id,
                        "specialty_id": specialty_id,
                        "cadre_id": cadre_id,
                        "email": email,
                        "marital_status": marital_status,
                        "home_town": home_town,
                        "residential_address": residential_address,
                        "passport_official": passport_official,
                        "passport_personal": passport_personal,
                        "passport_diplomatic": passport_diplomatic,
                        "phone": phone
                    }
                )),
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Employee, Employee"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            # MOVE THIS TO A FUNCTION LATER
            emp_data = {
                "employee_id": new_employee.id,
                "first_name": first_name,
                "last_name": last_name,
                "middle_name": middle_name,
            }

            # credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_pass)
            # parameters = pika.ConnectionParameters(
            #     host=rabbitmq_host, port=rabbitmq_port, credentials=credentials)
            # connection = pika.BlockingConnection(parameters)
            # channel = connection.channel()
            #
            # # Declare the queue if it doesn't exist
            # channel.queue_declare(queue=emp_queue_name, durable=True)
            #
            # # Publish the message to the queue
            # channel.basic_publish(exchange='',
            #                       routing_key=emp_queue_name,
            #                       body=json.dumps(emp_data))
            #
            # connection.close()
            # # END MOVE TO FUNCTION LATER

            return jsonify({'message': 'Employee added successfully'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error adding employee', 'error': str(e)}), 500
        finally:
            db.session.close()


def publish_to_redis(data):
    try:
        # Assume the incoming data is in JSON format
        # data = request.get_json()

        # Specify the Redis channel name
        channel = 'employeecreation'

        # Publish the JSON-serialized data to the Redis channel
        redis_client.publish(channel, json.dumps(data))

        return jsonify({'employee': 'Object published to Redis channel successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@custom_jwt_required
def get_employees():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)

        employee_query = Employee.query.filter_by(deleted_at=None)

        # Filtering by date_of_employment
        date_of_employment_start_date = request.args.get('date_of_employment_start_date')
        date_of_employment_end_date = request.args.get('date_of_employment_end_date')

        filtered_employee_ids = []

        if date_of_employment_start_date and date_of_employment_end_date:
            date_of_employment_start_date = datetime.strptime(date_of_employment_start_date, '%Y-%m-%d').date()
            date_of_employment_end_date = datetime.strptime(date_of_employment_end_date, '%Y-%m-%d').date()

            # Iterate through the employee query to filter based on decrypted date of employment
            for employee in employee_query:
                employee_str_date_of_employment = decrypt(employee.date_of_employment)

                # Convert the decrypted string date to a datetime object
                employee_date_of_employment = datetime.strptime(employee_str_date_of_employment, '%Y-%m-%d').date()

                # Check if the employee's date of employment falls within the specified range
                if date_of_employment_start_date <= employee_date_of_employment <= date_of_employment_end_date:
                    filtered_employee_ids.append(employee.id)

            # Filter the employee query based on the collected IDs
            employee_query = employee_query.filter(Employee.id.in_(filtered_employee_ids))

        # Continue with pagination or other operations on the filtered query

        elif date_of_employment_start_date:
            date_of_employment_start_date = datetime.strptime(date_of_employment_start_date, '%Y-%m-%d').date()

            # Iterate through the employee query to filter based on decrypted date of employment
            for employee in employee_query:
                employee_str_date_of_employment = decrypt(employee.date_of_employment)

                # Convert the decrypted string date to a datetime object
                employee_date_of_employment = datetime.strptime(employee_str_date_of_employment, '%Y-%m-%d').date()

                # Check if the employee's date of employment is greater than or equal to the start date
                if employee_date_of_employment >= date_of_employment_start_date:
                    filtered_employee_ids.append(employee.id)

            # Filter the employee query based on the collected IDs
            employee_query = employee_query.filter(Employee.id.in_(filtered_employee_ids))

        elif date_of_employment_end_date:

            date_of_employment_end_date = datetime.strptime(date_of_employment_end_date, '%Y-%m-%d').date()

            # Iterate through the employee query to filter based on decrypted date of employment
            for employee in employee_query:
                employee_str_date_of_employment = decrypt(employee.date_of_employment)

                # Convert the decrypted string date to a datetime object
                employee_date_of_employment = datetime.strptime(employee_str_date_of_employment, '%Y-%m-%d').date()

                # Check if the employee's date of employment is less than or equal to the end date
                if employee_date_of_employment <= date_of_employment_end_date:
                    filtered_employee_ids.append(employee.id)

            # Filter the employee query based on the collected IDs
            employee_query = employee_query.filter(Employee.id.in_(filtered_employee_ids))

        # Filter by date_of_retirement
        date_of_retirement_start_date = request.args.get('date_of_retirement_start_date')
        date_of_retirement_end_date = request.args.get('date_of_retirement_end_date')

        if date_of_retirement_start_date and date_of_retirement_end_date:
            date_of_retirement_start_date = datetime.strptime(date_of_retirement_start_date, '%Y-%m-%d').date()
            date_of_retirement_end_date = datetime.strptime(date_of_retirement_end_date, '%Y-%m-%d').date()
            employee_query = employee_query.filter(
                Employee.date_of_retirement.between(
                    date_of_retirement_start_date, date_of_retirement_end_date)
            )
        elif date_of_retirement_start_date:
            date_of_retirement_start_date = datetime.strptime(
                date_of_retirement_start_date, '%Y-%m-%d').date()
            employee_query = employee_query.filter(Employee.date_of_retirement >=
                                                   date_of_retirement_start_date)
        elif date_of_retirement_end_date:
            date_of_retirement_end_date = datetime.strptime(
                date_of_retirement_end_date, '%Y-%m-%d').date()
            employee_query = employee_query.filter(Employee.date_of_retirement <=
                                                   date_of_retirement_end_date)

        # filter by cadre
        cadre_id = request.args.get('cadre_id')
        if cadre_id:
            employee_query = employee_query.filter(Employee.cadre_id == cadre_id)

        # filter by rank
        rank_id = request.args.get('rank_id')
        if rank_id:
            employee_query = employee_query.filter(Employee.rank_id == rank_id)

        # filter by number of years in service
        number_of_years_in_service = request.args.get(
            'number_of_years_in_service')
        if number_of_years_in_service:
            current_date = datetime.now()
            years_in_service = (
                    func.datediff(
                        current_date, Employee.date_of_employment) / 365.25
            )
            employee_query = employee_query.filter(func.floor(years_in_service)
                                                   == int(number_of_years_in_service))
        # filter by state of origin
        state_id = request.args.get('state_id')
        if state_id:
            employee_query = employee_query.filter(Employee.state_id == state_id)

        # filter by employee specialty
        specialty_id = request.args.get('specialty_id')
        if specialty_id:
            employee_query = employee_query.filter(Employee.specialty_id == specialty_id)

        # filter by number of months to retirement
        months_until_retirement = request.args.get('months_until_retirement')
        if months_until_retirement:
            current_date = datetime.now()
            future_date = current_date + \
                          timedelta(days=30 * int(months_until_retirement))
            days_to_future = (future_date - current_date).days

            employee_query = employee_query.filter(
                (
                        (
                                (((func.datediff(current_date, Employee.dob)) /
                                  365.25) + (days_to_future / 365.25)) >= 60
                        ) |
                        (
                                (((func.datediff(current_date, Employee.date_of_employment)
                                   ) / 365.25) + (days_to_future / 365.25)) >= 35
                        ) |
                        (
                                Employee.rank_id == get_employee_rank_id(
                            17, Employee.cadre_id)
                        ) &
                        (
                                Employee.last_promotion_date is not None
                        ) &
                        (
                                (((func.datediff(current_date, Employee.last_promotion_date)
                                   ) / 365.25) + (days_to_future / 365.25)) >= 8
                        )
                )
            )

        # filter by deployed employees
        deployed_employees = request.args.get('deployed_employees')
        if deployed_employees:
            current_date = datetime.now()
            employee_query = employee_query.filter(
                exists()
                .where(
                    (Employee.id == EmployeeDeployments.employee_id) &
                    (EmployeeDeployments.expected_date_of_return >= current_date) &
                    (EmployeeDeployments.employee_id == Employee.id)
                )
            )

        # filter by employees on secondment
        employee_secondment = request.args.get('employee_secondment')
        if employee_secondment:
            current_date = datetime.now()
            employee_query = employee_query.filter(
                exists()
                .where(
                    (Employee.id == EmployeeDeployments.employee_id) &
                    (EmployeeDeployments.expected_date_of_return >= current_date) &
                    (EmployeeDeployments.employee_id == Employee.id) &
                    (EmployeeDeployments.type == 3)
                )
            )

        # filter employees who have taken training in a year
        has_taken_training = request.args.get('has_taken_training')
        if has_taken_training:
            one_year_ago = datetime.now() - timedelta(days=365)
            employee_query = employee_query.filter(
                exists()
                .where(
                    (Employee.id == EmployeeTraining.employee_id) &
                    (EmployeeTraining.created_at >= one_year_ago)
                )
            )

        # filter employees who have taken training in a year
        posted_employees = request.args.get('posted_employees')
        if posted_employees:
            employee_query = employee_query.filter(
                exists()
                .where(
                    (Employee.id == EmployeePosting.employee_id) &
                    (EmployeePosting.date_of_return.is_(None))
                )
            )

        # filter by retired employment_status = 1, 2, and 3
        employment_status = request.args.get('employment_status')
        if employment_status == "0":
            employee_query = employee_query.filter(
                Employee.employment_status == 0)
        elif employment_status == "1":
            employee_query = employee_query.filter(
                Employee.employment_status == 1)
        elif employment_status == "2":
            employee_query = employee_query.filter(
                Employee.employment_status == 2)
        elif employment_status == "3":
            employee_query = employee_query.filter(
                Employee.employment_status == 3)

        employees = employee_query.paginate(page=page, per_page=per_page)

        employee_list = []

        for employee in employees.items:  # Use .items to get the list of employees from the pagination object
            employee_data = employee.to_dict()

            if search_term:
                search_pattern = search_term.lower()

                first_name = employee_data['first_name'].lower()  # Use dictionary key access
                last_name = employee_data['last_name'].lower()  # Use dictionary key access
                pf_number = employee_data['pf_num'].lower()  # Use dictionary key access

                # Check if the search pattern is in any of the fields
                if (search_pattern in first_name or
                        search_pattern in last_name or
                        search_pattern in pf_number):
                    employee_list.append(employee_data)
            else:
                # If no search term, just add the employee data
                employee_list.append(employee_data)

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("list_employee"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, Employee"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        response = {
            "status": "success",
            "status_code": 200,
            "employees": employee_list,
            "total_pages": employees.pages,
            "current_page": employees.page,
            "total_items": employees.total,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of users: {str(e)}",
        }

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_employee(employee_id):
    try:
        employee = Employee.query.filter_by(
            id=employee_id, deleted_at=None).first()
        if employee:
            employee_data = employee.to_dict()

            # Fetching awards for the employee
            awards_list = []
            for award in employee.employee_award:
                imp = get_implication(award.implication_id)
                awr = get_award(award.award_id)
                award_data = {
                    'employee_award_id': award.id,
                    'implication_id': award.implication_id,
                    'type': award.type,
                    'reason': decrypt(award.reason),
                    'date_given': award.date_given,
                    'employee_id': award.employee_id,
                    'implication': {
                        'id': imp.id if imp else None,
                        'name': decrypt(imp.name) if imp else None
                    } if imp is not None else None,
                    'award': {
                        'id': awr.id if awr else None,
                        'name': decrypt(awr.name) if awr else None
                    } if awr is not None else None
                }

                awards_list.append(award_data)

            employee_posting = EmployeePosting.query.filter_by(
                employee_id=employee_id)
            postings_list = []
            for posting in employee_posting:
                posting_data = {
                    'designation_at_post': decrypt(posting.designation_at_post),
                    'assumption_date': decrypt(posting.assumption_date),
                    'expected_return_date': decrypt(posting.expected_date_of_return),
                    'date_of_return': decrypt(posting.date_of_return),
                    'posting_type': posting.posting_type,
                    'reason': decrypt(posting.reason),

                    'parent_id': posting.parent_id,
                    'status': posting.status,
                    'region': posting.region.to_dict() if posting.region else None,
                    'station': posting.station.to_dict() if posting.station else None,
                }
                postings_list.append(posting_data)

            employee_deployment = EmployeeDeployments.query.filter_by(employee_id=employee_id)
            deployments_list = []
            for deployment in employee_deployment:
                deployment_data = {
                    'date_of_assumption': decrypt(deployment.date_of_assumption),
                    'expected_date_of_return': decrypt(deployment.expected_date_of_return),
                    'deployed_to': decrypt(deployment.deployed_to),
                    'type': deployment.type,
                    'department': deployment.department.to_dict() if deployment.department else None,
                    'directorate': deployment.directorate.to_dict() if deployment.directorate else None,
                }
                deployments_list.append(deployment_data)

            employee_sanction = EmployeeSanction.query.filter_by(employee_id=employee_id)
            sanctions_list = []

            for sanction in employee_sanction:
                sanction_data = {
                    'type': sanction.type,
                    'reason': decrypt(sanction.reason),
                    'date_given': decrypt(sanction.date_given),
                    'implication_id': sanction.implication_id,
                    'sanction': sanction.sanction.to_dict() if sanction.sanction else None,

                }
                sanctions_list.append(sanction_data)

            employee_training = EmployeeTraining.query.filter_by(employee_id=employee_id)
            trainings_list = []

            for training in employee_training:
                training_data = {
                    'date_issued': training.date_issued if training.date_issued else None,
                    'date_approved': decrypt(training.date_approved) if training.date_approved else None,
                    'category': training.category_id if training.category_id else None,
                    'created_at': training.created_at,
                    'date_attended': decrypt(training.date_attended) if training.date_attended else None,
                    'training': {'id': training.training.id, 'name': decrypt(training.training.name),
                                 'description': decrypt(training.training.description)} if training.training else None,

                }
                trainings_list.append(training_data)

            employee_conference = EmployeeConference.query.filter_by(employee_id=employee_id)
            conference_list = []

            for conference in employee_conference:
                conference_data = {
                    'date_attended': conference.date_attended,
                    'conference': conference.conference.to_dict() if conference.conference else None,
                }
                conference_list.append(conference_data)

            employee_dependent = EmployeeDependent.query.filter_by(employee_id=employee_id)
            dependent_list = []

            for dependent in employee_dependent:
                dependent_data = dependent.to_dict()
                dependent_list.append(dependent_data)

            employee_nok = NextOfKin.query.filter_by(employee_id=employee_id, category_id=1)
            nok_list = []

            for nok in employee_nok:
                nok_data = nok.to_dict()
                nok_list.append(nok_data)

            employee_promotion = EmployeePromotion.query.filter_by(
                employee_id=employee_id)
            promotion_list = []

            for promotion in employee_promotion:
                promotion_data = {
                    'promotion_date': decrypt(promotion.promotion_date),
                    'next_promotion_date': decrypt(promotion.next_promotion_date),
                    'last_promotion_date': decrypt(promotion.last_promotion_date),
                    'status': promotion.status,
                    "previous_rank_id": promotion.previous_rank_id,
                    "previous_rank_level": promotion.previous_rank.level,
                    "current_rank_id": promotion.current_rank_id,
                    "current_rank_level": promotion.current_rank.level,
                    "promotion_cadre": get_cadre_name(promotion.current_rank.cadre_id)
                }
                promotion_list.append(promotion_data)

            employee_data['awards'] = awards_list
            employee_data['postings'] = postings_list
            employee_data['deployments'] = deployments_list
            employee_data['sanctions'] = sanctions_list
            employee_data['trainings'] = trainings_list
            employee_data['conferences'] = conference_list
            employee_data['dependents'] = dependent_list
            employee_data['promotions'] = promotion_list
            employee_data['nok'] = nok_list

            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
                "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
                "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
                "event": encrypt("view_employee"),
                "auditable_id": None,
                "old_values": None,
                "new_values": None,
                "url": encrypt(request.url),
                "ip_address": encrypt(request.remote_addr),
                "user_agent": encrypt(request.user_agent.string),
                "tags": encrypt("Employee, Employee, View"),
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)

            return jsonify({'employee': employee_data})
            # marital status, email, grade level, date of next prom, years of service, date of retirement
            # employment status
        else:
            return jsonify({'message': 'Employee not found'}), 404

    except Exception as e:
        error_message = "An error occurred: " + str(e)
        return jsonify({'error': error_message}), 500


@custom_jwt_required
def delete_employee(employee_id):
    employee = Employee.query.filter_by(id=employee_id).first()

    if employee is None:
        return jsonify({'message': 'Employee not found'}), 404

    try:
        employee.soft_delete()
        db.session.commit()

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("delete_employee"),
            "auditable_id": employee.id,
            "new_values": None,
            "old_values": encrypt(json.dumps(
                {
                    "first_name": employee.first_name,
                    "last_name": employee.last_name,
                    "middle_name": employee.middle_name,
                    "pf_num": employee.pf_num,
                    "dob": employee.dob,
                    "date_of_appointment": employee.date_of_appointment,
                    "date_of_employment": employee.date_of_employment,
                    "gender_id": employee.gender_id,
                    "state_id": employee.state_id,
                    "lga_id": employee.lga_id,
                    "directorate_id": employee.directorate_id,
                    "department_id": employee.department_id,
                    "unit_id": employee.unit_id,
                    "religion_id": employee.religion_id,
                    "rank_id": employee.rank_id,
                    "designation_id": employee.designation_id,
                    "specialty_id": employee.specialty_id,
                    "cadre_id": employee.cadre_id,
                    "email": employee.email,
                    "marital_status": employee.marital_status,
                    "photo": employee.photo,
                    "phone": employee.phone,
                    "home_town": employee.home_town,
                    "residential_address": employee.residential_address,
                    "passport_official": employee.passport_official,
                    "passport_personal": employee.passport_personal,
                    "passport_diplomatic": employee.passport_diplomatic,
                }
            )),
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, Employee"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        return jsonify({'message': 'Employee deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting employee', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_employee(employee_id):
    employee = Employee.query.filter_by(id=employee_id).first()

    if employee is None:
        return jsonify({'message': 'Employee not found'}), 404

    try:
        employee.restore()
        db.session.commit()

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": "restore_employee",
            "auditable_id": employee.id,
            "new_values": None,
            "old_values": json.dumps(
                {
                    "first_name": employee.first_name,
                    "last_name": employee.last_name,
                    "middle_name": employee.middle_name,
                    "pf_num": employee.pf_num,
                    "dob": employee.dob.strftime('%Y-%m-%d'),
                    "date_of_appointment": employee.date_of_appointment.strftime('%Y-%m-%d'),
                    "date_of_employment": employee.date_of_employment.strftime('%Y-%m-%d'),
                    "gender_id": employee.gender_id,
                    "state_id": employee.state_id,
                    "lga_id": employee.lga_id,
                    "directorate_id": employee.directorate_id,
                    "department_id": employee.department_id,
                    "unit_id": employee.unit_id,
                    "religion_id": employee.religion_id,
                    "rank_id": employee.rank_id,
                    "designation_id": employee.designation_id,
                    "specialty_id": employee.specialty_id,
                    "cadre_id": employee.cadre_id,
                    "email": employee.email,
                    "photo": employee.photo,
                    "home_town": employee.home_town,
                    "residential_address": employee.residential_address,
                    "passport_official": employee.passport_official,
                    "passport_personal": employee.passport_personal,
                    "passport_diplomatic": employee.passport_diplomatic,
                    "phone": employee.phone
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Employee, Employee",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)

        return jsonify({'message': 'Employee restored successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error restoring employee', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def edit_employee(employee_id):
    # Get the employee to be edited from the database
    employee = Employee.query.filter_by(
        id=employee_id, deleted_at=None).first()

    # Check if the employee exists
    if not employee:
        return jsonify({'message': 'Employee not found'}), 404

    # Parse the JSON data from the request
    data = request.get_json()

    new_values = encrypt(json.dumps(
        {
            "first_name": encrypt(data.get('first_name')),
            "last_name": encrypt(data.get('last_name')),
            "middle_name": data.get('middle_name'),
            "pf_num": data.get('pf_num'),
            "dob": data.get('dob'),
            "date_of_appointment": data.get('date_of_appointment'),
            "date_of_employment": data.get('date_of_employment'),
            "gender_id": data.get('gender_id'),
            "state_id": data.get('state_id'),
            "lga_id": data.get('lga_id'),
            "directorate_id": data.get('directorate_id'),
            "department_id": data.get('department_id'),
            "unit_id": data.get('unit_id'),
            "religion_id": data.get('religion_id'),
            "rank_id": data.get('rank_id'),
            "designation_id": data.get('designation_id'),
            "specialty_id": data.get('specialty_id'),
            "cadre_id": data.get('cadre_id'),
            "email": data.get('email'),
            "photo": data.get('photo'),
            "marital_status": data.get('marital_status'),
            "home_town": data.get('home_town'),
            "residential_address": data.get('residential_address'),
            "passport_official": employee.passport_official,
            "passport_personal": employee.passport_personal,
            "passport_diplomatic": employee.passport_diplomatic,
            "phone": employee.phone,
            "employment_status": employee.employment_status,
            "date_of_retirement": data.get('date_of_retirement'),
            "category": data.get('category'),
            "stagnation": data.get('stagnation')
        }
    ))

    old_values = encrypt(json.dumps(
        {
            "first_name": employee.first_name,
            "last_name": employee.last_name,
            "middle_name": employee.middle_name,
            "pf_num": employee.pf_num,
            "dob": employee.dob,
            "date_of_appointment": employee.date_of_appointment,
            "date_of_employment": employee.date_of_employment,
            "gender_id": employee.gender_id,
            "state_id": employee.state_id,
            "lga_id": employee.lga_id,
            "directorate_id": employee.directorate_id,
            "department_id": employee.department_id,
            "unit_id": employee.unit_id,
            "religion_id": employee.religion_id,
            "rank_id": employee.rank_id,
            "designation_id": employee.designation_id,
            "specialty_id": employee.specialty_id,
            "cadre_id": employee.cadre_id,
            "email": employee.email,
            "photo": employee.photo,
            "home_town": employee.home_town,
            "marital_status": employee.marital_status,
            "residential_address": employee.residential_address,
            "passport_official": employee.passport_official,
            "passport_personal": employee.passport_personal,
            "passport_diplomatic": employee.passport_diplomatic,
            "phone": employee.phone,
            'employment_status': employee.employment_status,
            'date_of_retirement': str(employee.date_of_retirement),
            'category': employee.category,
            'stagnation': employee.stagnation,
            'grade_on_app': employee.grade_on_app,
            'year_of_grad': employee.year_of_grad,
            'confirmation_of_app': employee.confirmation_of_app,
            'qualification': employee.qualification
        }
    ))

    # Update the employee attributes based on the request data
    employee.first_name = encrypt(data.get('first_name', employee.first_name))
    employee.last_name = encrypt(data.get('last_name', employee.last_name))
    employee.middle_name = encrypt(data.get('middle_name', employee.middle_name))
    employee.pf_num = encrypt(data.get('pf_num', employee.pf_num))
    employee.dob = encrypt(data.get('dob', employee.dob))
    employee.date_of_appointment = encrypt(data.get(
        'date_of_appointment', employee.date_of_appointment))
    employee.date_of_employment = encrypt(data.get(
        'date_of_employment', employee.date_of_employment))
    employee.gender_id = data.get('gender_id', employee.gender_id)
    employee.state_id = data.get('state_id', employee.state_id)
    employee.cadre_id = data.get('cadre_id', employee.cadre_id)
    employee.lga_id = data.get('lga_id', employee.lga_id)
    employee.directorate_id = data.get(
        'directorate_id', employee.directorate_id)
    employee.department_id = data.get('department_id', employee.department_id)
    employee.unit_id = data.get('unit_id', employee.unit_id)
    employee.religion_id = data.get('religion_id', employee.religion_id)
    employee.rank_id = data.get('rank_id', employee.rank_id)
    employee.designation_id = data.get(
        'designation_id', employee.designation_id)
    employee.specialty_id = data.get('specialty_id', employee.specialty_id)
    employee.email = encrypt(data.get('email', employee.email))
    employee.photo = encrypt(data.get('photo', employee.photo))
    employee.marital_status = encrypt(data.get(
        'marital_status', employee.marital_status))
    employee.home_town = encrypt(data.get(
        'home_town', employee.home_town))
    employee.residential_address = encrypt(data.get(
        'residential_address', employee.residential_address))
    employee.passport_official = encrypt(data.get(
        'passport_official', employee.passport_official))
    employee.passport_personal = encrypt(data.get(
        'passport_personal', employee.passport_personal))
    employee.passport_diplomatic = encrypt(data.get(
        'passport_diplomatic', employee.passport_diplomatic))

    employee.employment_status = 0 if data.get('employment_status') == 11 else data.get('employment_status',
                                                                                        employee.employment_status)
    employee.phone = encrypt(data.get(
        'phone', employee.phone))
    employee.date_of_retirement = encrypt(data.get(
        'date_of_retirement', employee.date_of_retirement))
    employee.category = encrypt(data.get(
        'category', employee.category))

    employee.grade_on_app = encrypt(data.get(
        'grade_on_app', employee.grade_on_app))
    employee.year_of_grad = encrypt(data.get(
        'year_of_grad', employee.year_of_grad))
    employee.confirmation_of_app = encrypt(data.get(
        'confirmation_of_app', employee.confirmation_of_app))
    employee.qualification = encrypt(data.get(
        'qualification', employee.qualification))
    employee.stagnation = encrypt(data.get(
        'stagnation', employee.stagnation))
    employee.language_spoken = encrypt(data.get(
        'language_spoken', employee.language_spoken))

    try:
        # Commit the changes to the database
        db.session.commit()

        # Return a JSON response indicating success
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("edit_employee"),
            "auditable_id": employee.id,
            "new_values": new_values,
            "old_values": old_values,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, Employee"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        return jsonify({"message": f"Employee has been successfully updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error saving employee', 'error': str(e)}), 500
    finally:
        db.session.close()


# Set to store generated numbers
generated_numbers = set()


def generate_unique_number():
    while True:
        new_num = f'{random.randint(1000, 2000):06}'
        if new_num not in generated_numbers:
            generated_numbers.add(new_num)
            return new_num


def faker_employee():
    insert_queries = []
    for _ in range(200):
        first_name = fake.first_name()
        last_name = fake.last_name()
        middle_name = fake.first_name()
        pf_num = generate_unique_number()
        dob = fake.date_of_birth(
            minimum_age=18, maximum_age=59).strftime('%Y-%m-%d')
        date_of_appointment = fake.date_between_dates(datetime.strptime(
            '2015-01-01', '%Y-%m-%d'), datetime.strptime('2023-12-31', '%Y-%m-%d')).strftime('%Y-%m-%d')
        date_of_employment = fake.date_between_dates(datetime.strptime(
            '2015-01-01', '%Y-%m-%d'), datetime.strptime('2023-12-31', '%Y-%m-%d')).strftime('%Y-%m-%d')
        gender_id = random.randint(1, 2)
        state_id = random.randint(1, 36)
        # lga_id = random.randint(1, 20)
        directorate_id = random.randint(1, 9)
        # department_id = random.randint(7, 11)
        # unit_id = random.randint(7, 11)
        # religion_id = random.randint(1, 2)
        rank_id = random.randint(1, 9)
        # designation_id = random.randint(1, 3)
        # specialty_id = random.randint(1, 5)
        email = fake.email()
        cadre_id = 1
        last_promotion_date = fake.date_between_dates(datetime.strptime(
            '2020-01-01', '%Y-%m-%d'), datetime.strptime('2023-12-31', '%Y-%m-%d')).strftime('%Y-%m-%d')
        employment_status = 0
        # retired = random.randint(0, 1)
        marital_status = random.randint(1, 2)
        residential_address = '3 gwani street, wuse zone 4, abuja'

        query = f"INSERT IGNORE INTO flask.employee (first_name, last_name, middle_name, pf_num, dob, date_of_appointment, date_of_employment, gender_id, state_id, directorate_id, rank_id, email, cadre_id, last_promotion_date, employment_status) VALUES ('{first_name}', '{last_name}', '{middle_name}', '{pf_num}', '{dob}', '{date_of_appointment}', '{date_of_employment}', {gender_id}, {state_id}, {directorate_id}, {rank_id},'{email}', {cadre_id}, '{last_promotion_date}', {employment_status});"
        insert_queries.append(query)

        # Writing queries to an SQL file
    file_path = 'generated_data.sql'  # Change the file path as needed

    with open(file_path, 'w') as sql_file:
        for query in insert_queries:
            sql_file.write(query + '\n')

    return jsonify({"message": f"Generated SQL statements and saved to {file_path}"}), 200


def sorting_key(employee_dict):
    # Replace 'dob' with the actual key in your dictionary
    dob_str = employee_dict.get('dob')
    if dob_str:
        dob = datetime.strptime(dob_str, "%Y-%m-%d")
        return dob
    else:
        # Handle the case where 'dob' is not present in the dictionary
        return datetime.min  # or any other appropriate default value


@custom_jwt_required
def bulk_upload_employee():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        try:
            df = pd.read_excel(file)

            # Check for duplicates in the uploaded file's PF_NUM column
            duplicates = df["PF_NUM"].duplicated(keep=False)
            if duplicates.any():
                selected_columns = ['PF_NUM', 'FIRST_NAME',
                                    'MIDDLE_NAME', 'LAST_NAME']
                duplicate_rows_data = df[duplicates][selected_columns].reset_index().rename(
                    columns={'index': 'row_number'})

                # Excel row number (1-based) adjustment
                duplicate_rows_data['row_number'] += 2
                duplicate_rows_data = duplicate_rows_data.to_dict(
                    orient='records')

                return jsonify({
                    "error": f"The column PF NUMBER has duplicate values in the following rows:",
                    "rows": duplicate_rows_data
                }), 500

            # Check for empty PF_NUM column
            empty_rows = df[df["PF_NUM"].isnull()]
            if not empty_rows.empty:
                selected_columns = ['FIRST_NAME', 'MIDDLE_NAME', 'LAST_NAME']
                empty_rows_data = empty_rows[selected_columns].reset_index().rename(columns={
                    'index': 'row_number'})

                # Excel row number (1-based) adjustment
                empty_rows_data['row_number'] += 2
                empty_rows_data = empty_rows_data.to_dict(orient='records')

                return jsonify({
                    "error": f"The column PF NUMBER is empty for the following rows:",
                    "rows": empty_rows_data
                }), 500

            success_count = 0
            for index, row in df.iterrows():
                row = row.where(pd.notna(row), None)  # Replace NaN with None

                # Fetch all PF_NUMs from the database and decrypt them
                employees = Employee.query.all()
                decrypted_pf_nums = {
                    decrypt(emp.pf_num): emp for emp in employees}

                # Check if the decrypted PF_NUM exists in the database
                if row['PF_NUM'] in decrypted_pf_nums:
                    return jsonify({
                        "error": f"Record with PF Number {row['PF_NUM']} already exists"
                    }), 500
                else:
                    # Create a new employee record with encrypted data
                    new_employee = Employee(
                        first_name=row['FIRST_NAME'],
                        last_name=row['LAST_NAME'],
                        middle_name=row['MIDDLE_NAME'],
                        pf_num=row['PF_NUM'],
                        dob=row['DOB'],
                        date_of_appointment=row['DATE_OF_APPOINTMENT_INTO_'],
                        last_promotion_date=row['EFFECTIVE_DATE_OF_LAST_PROMOTION'],
                        photo='',
                        marital_status=row['MARITAL_STATUS'],
                        home_town=row['HOME_TOWN'],
                        residential_address=row['RESIDENTIAL_ADDRESS'],
                        passport_official=row['PASSPORT_OFFICIAL'],
                        passport_personal=row['PASSPORT_STANDARD'],
                        passport_diplomatic=row['PASSPORT_DIPLOMATIC'],
                        date_of_employment=row['DATE_OF_FIRST_APPOINTMENT'],
                        gender_id=row['GENDER_ID'],
                        state_id=row['STATE_ID'],
                        lga_id=row['LGA_ID'],
                        religion_id=row['RELIGION_ID'],
                        directorate_id=row['DIRECTORATE_ID'],
                        cadre_id=row['CADRE_ID'],
                        department_id=row['DEPARTMENT_ID'],
                        unit_id=row['UNIT_ID'],
                        rank_id=row['RANK_ID'],
                        designation_id=row['DESIGNATION_ID'],
                        specialty_id=row['SPECIALTY_ID'],
                        email=row['EMAIL'],
                        phone=str(row['PHONE']),
                        category=row['CATEGORY'],
                        grade_on_app=row['GRADE_ON_APPOINTMENT'],
                        year_of_grad=row['YEAR_OF_GRADUATION'],
                        confirmation_of_app=row['CONFIMATION_OF_APPOINTMENT'],
                        qualification=row['QUALIFICATION'],
                        stagnation=row['STAGNATION'],
                        language_spoken=row['LANGUAGE_SPOKEN'],
                        employment_status=row['EMPLOYMENT_STATUS'] if row['EMPLOYMENT_STATUS'] is not None else 0,
                        date_of_retirement=row['DATE_OF_RETIREMENT']
                    )

                    try:
                        db.session.add(new_employee)
                        db.session.commit()
                        success_count += 1

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
                "event": encrypt("bulk_upload_employee"),
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
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'File not found'}), 400


def upcoming_retirement():
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    search_term = request.args.get('q', default=None, type=str)

    current_date = datetime.now()
    future_date = current_date + timedelta(days=4 * 30)
    days_to_future = (future_date - current_date).days

    try:
        employees = (
            Employee.query
            .options(joinedload(Employee.directorate))
            .options(joinedload(Employee.rank))
            .options(joinedload(Employee.department))
            .filter(
                (Employee.employment_status == 0) &
                (
                        (
                                (
                                        (func.datediff(current_date, Employee.dob) / 365.25) +
                                        (days_to_future / 365.25)
                                ) >= 60
                        ) |
                        (
                                (
                                        (func.datediff(current_date, Employee.date_of_employment) / 365.25) +
                                        (days_to_future / 365.25)
                                ) >= 35
                        ) |
                        (
                                (
                                    Employee.rank.has(Rank.level == 17)
                                ) &
                                (
                                        Employee.last_promotion_date is not None
                                ) &
                                (
                                        ((func.datediff(current_date, Employee.last_promotion_date) / 365.25) + (
                                                days_to_future / 365.25)) >= 8
                                )
                        )
                )
            )
        )

        employees_turning_sixty_in_four_months = []
        employees_retiring = employees.paginate(page=page, per_page=per_page)

        for emp in employees_retiring:
            emp_object = {
                'id': emp.id,
                'first_name': emp.first_name,
                'last_name': emp.last_name,
                'middle_name': emp.first_name,
                'photo': emp.photo,
                'rank': {
                    'rank_id': emp.rank.id,
                    'level': emp.rank.level,
                    'name': emp.rank.name
                },
                'directorate': {
                    'id': emp.directorate.id if emp.directorate else None,
                    'name': emp.directorate.name if emp.directorate else None
                },
                'department': {
                    'id': emp.department.id if emp.department else None,
                    'name': emp.department.name if emp.department else None
                },
                'retirement_date': get_retirement_date(emp),
                'past_retirement_date': compare_dates(get_retirement_date(emp))
            }
            employees_turning_sixty_in_four_months.append(emp_object)

        sorted_employees = sorted(
            employees_turning_sixty_in_four_months, key=sorting_key, reverse=True)

        response = {
            "status": "success",
            "status_code": 200,
            "employees": sorted_employees,
            "total_pages": employees_retiring.pages,
            "current_page": employees_retiring.page,
            "total_items": employees_retiring.total,
            'dates_to_future': days_to_future
        }

        return jsonify(response)

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of users: {str(e)}",
        }
        return jsonify(response)


def check_key():
    key = get_app_encryption_key()
    if key is None:
        return jsonify({"message": key}), 200
    else:
        return jsonify({"message": key}), 200
