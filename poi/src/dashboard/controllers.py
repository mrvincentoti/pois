from flask import request, jsonify, g
from datetime import datetime, date, timedelta
import uuid
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import or_, and_, extract
from sqlalchemy.orm import joinedload, aliased
from sqlalchemy import func  # Import func from SQLAlchemy
import json


from .. import db
from ..rabbitmq_manager import publish_to_rabbitmq
from ..redis_manager import  custom_jwt_required
from ..directorate.models import Directorate
from ..department.models import Department
from ..employee.models import Employee
from ..rank.models import Rank
from ..cadre.models import Cadre
from ..employeePosting.models import EmployeePosting

from ..region.models import Region
from ..station.models import Station
from ..country.models import Country
from ..gender.models import Gender
from ..util import encrypt

current_date = datetime.now()
future_date = current_date + timedelta(days=4 * 30)
days_to_future = (future_date - current_date).days

def get_retirement_date(emp_object):
    return emp_object['retirement_date']

def get_posting_children(posting_id):
    children_list = []
    postings = EmployeePosting.query.filter_by(
        parent_id=posting_id).order_by(EmployeePosting.id.asc())

    for posting in postings:
        employee_data = Employee.query.filter_by(
            id=posting.employee_id).first()
        region_data = Region.query.filter_by(id=posting.region_id).first()
        station_data = Station.query.filter_by(id=posting.station_id).first()
        country_data = Country.query.filter_by(
            id=station_data.country_id).first()

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
    posting = EmployeePosting.query.filter_by(
        id=posting_id, posting_type=2).first()
    if posting:
        return True
    else:
        return False


def display_action(emp):
    if emp is not None and emp < current_date:
        return 'Action Required'

def get_employee_retirement_date(emp, current_date=current_date, days_to_future=days_to_future):
    retirement_age = None
    if(((current_date - emp.dob).days / 365.25) + (days_to_future / 365.25) >= 60):
        retirement_age = emp.dob + timedelta(days=60 * 365.25)
        return retirement_age
    if((current_date - emp.date_of_employment).days / 365.25) + (days_to_future / 365.25) >= 35:
        retirement_age = emp.date_of_employment + timedelta(days=35 * 365.25)
        return retirement_age
    if(emp.rank.level == 17 and \
                emp.last_promotion_date is not None and \
                (((future_date - emp.last_promotion_date).days / 365.25) + (days_to_future / 365.25)) >= 8):
        retirement_age = emp.last_promotion_date + timedelta(days=8 * 365.25)
        return retirement_age
    
    
def get_employee_promotion_date(emp):
    promotion_term = None
    
    if emp.rank.level >= 15 and emp.last_promotion_date is not None:
        promotion_term = emp.last_promotion_date + timedelta(days=365*4)
    elif emp.rank.level < 15 and emp.last_promotion_date is not None:
        promotion_term = emp.last_promotion_date + timedelta(days=365.5*3)
        
    return promotion_term
    


@custom_jwt_required
def get_data():
    try:
        # Count of employees, directorates, department, and deployment
        directorate_count = Directorate.query.filter(Directorate.deleted_at.is_(None)).count()
        department_count = Department.query.filter(Department.deleted_at.is_(None)).count()
        departmentList= Department.query.filter(Department.deleted_at.is_(None))
        employee_count = Employee.query.filter(Employee.deleted_at.is_(None)).filter(Employee.employment_status == 0).count()
        employee_deployment_count = EmployeeDeployments.query.filter(EmployeeDeployments.deleted_at.is_(None)).count()
        
        # Begin cadre query
        subquery = (
            db.session.query(Employee.cadre_id, func.count(Employee.id).label('employee_count'))
            .filter(Employee.employment_status == 0)
            .group_by(Employee.cadre_id)
            .subquery()
        )

        # Use the subquery in the main query to left join Cadre with the employee count
        cadre_with_employee_count = (
            db.session.query(Cadre.name, func.coalesce(subquery.c.employee_count, 0).label('employee_count'))
            .outerjoin(subquery, Cadre.id == subquery.c.cadre_id)
            .all()
        )

        cadre_names_list = [
            cadre.to_dict()['name']
            for cadre in Cadre.query.filter(Cadre.deleted_at.is_(None)).all()
        ]

        cadre_categories = cadre_names_list
        
        cadre_counts = [count for _, count in cadre_with_employee_count]
        
        all_cadres = Cadre.query.with_entities(Cadre.id).all()

        cadre_with_retiring_4_months = (
            Cadre.query
            .join(Employee)
            .join(Rank)
            .filter(
                (
                    (
                        (((func.datediff(current_date, Employee.dob)) / 365.25) + (days_to_future / 365.25)) >= 60
                    ) |
                    (
                        (((func.datediff(current_date, Employee.date_of_employment)) / 365.25) + (days_to_future / 365.25)) >= 35
                    ) |
                    (
                        Rank.level == 17
                    ) &
                    (
                        Employee.last_promotion_date is not None
                    ) &
                    (
                        (((func.datediff(current_date, Employee.last_promotion_date)) / 365.25) + (days_to_future / 365.25)) >= 8
                    )
                )
            )
            .with_entities(Cadre.id, func.count(Employee.id).label('employee_count'))
            .group_by(Cadre.id)
            .all()
        )
        
        cadre_with_retiring_4_months_dict = {cadre_id: count for cadre_id, count in cadre_with_retiring_4_months}
        retiring_4_months_counts = [cadre_with_retiring_4_months_dict.get(cadre.id, 0) for cadre in all_cadres]


        cadre_employee_vs_retiring_in_directorate = [
            {
                'name': 'Employees per Cadre',
                'data': cadre_counts
            },
            {
                'name': 'Employees per cadre Retiring in 4 months',
                'data': retiring_4_months_counts
            }
        ]
        
        # End Cadre query
        
        directorates_with_employee_count = (
            Directorate.query
            .outerjoin(Employee)
            .with_entities(Directorate.name, func.count(Employee.id))
            .group_by(Directorate.id)
            .all()
        )

        directorate_names_list = [
            directorate.to_dict()['name']
            for directorate in Directorate.query.filter(Directorate.deleted_at.is_(None)).all()
        ]

        categories = directorate_names_list

        
        # Compile the data for each series
        employee_counts = [count for _, count in directorates_with_employee_count]

        # Assuming Directorate model has 'id' field
        all_directorates = Directorate.query.with_entities(Directorate.id).all()

        directorates_with_retiring_4_months = (
            Directorate.query
            .outerjoin(Employee)
            .outerjoin(Rank)
            .filter(
                (
                    (
                        (((func.datediff(current_date, Employee.dob)) / 365.25) + (days_to_future / 365.25)) >= 60
                    ) |
                    (
                        (((func.datediff(current_date, Employee.date_of_employment)) / 365.25) + (days_to_future / 365.25)) >= 35
                    ) |
                    (
                        Rank.level == 17
                    ) &
                    (
                        Employee.last_promotion_date is not None
                    ) &
                    (
                        (((func.datediff(current_date, Employee.last_promotion_date)) / 365.25) + (days_to_future / 365.25)) >= 8
                    )
                )
            )
            .with_entities(Directorate.id, func.count(Employee.id).label('employee_count'))
            .group_by(Directorate.id)
            .all()
        )

        # Create a dictionary with directorate id as key and employee count as value
        retiring_4_months_counts_dict = {directorate_id: count for directorate_id, count in directorates_with_retiring_4_months}

        # Create a list with zero for directorates that do not have data
        retiring_4_months_counts = [retiring_4_months_counts_dict.get(directorate.id, 0) for directorate in all_directorates]
      

        employee_vs_retiring_in_directorate = [
            {
                'name': 'Employees in Department',
                'data': employee_counts
            },
            {
                'name': 'Retiring in 4 months',
                'data': retiring_4_months_counts
            }
        ]
        
        # Get employee who will either turn 60 years, or would have served for 35 years
        # or have would have spent 8 years as a director in four months or less
        employees = (
            Employee.query
            .options(joinedload(Employee.directorate))
            .options(joinedload(Employee.rank))
            .options(joinedload(Employee.department)) 
            .filter(Employee.employment_status == 0)
            .filter(
                (
                    (
                        (((func.datediff(current_date, Employee.dob)) / 365.25) +
                         (days_to_future / 365.25)) >= 60
                    ) |
                    (
                        (((func.datediff(current_date, Employee.date_of_employment)) /
                          365.25) + (days_to_future / 365.25)) >= 35
                    ) |
                    (
                        (Rank.level == 17) &
                        (Employee.last_promotion_date is not None) &
                        (((func.datediff(current_date, Employee.last_promotion_date)) /
                          365.25) + (days_to_future / 365.25)) >= 8
                    )
                )
            )

            .all()
        )
        employees_turning_sixty_in_four_months = []
        
        for emp in employees:
            emp_object = {
                'id': emp.id,
                'first_name': emp.first_name,
                'last_name': emp.last_name,
                'middle_name': emp.middle_name,
                'photo': emp.photo,
                'pf_num': emp.pf_num,
                'directorate': {
                    'id': emp.directorate.id if emp.directorate else None,
                    'name': emp.directorate.name if emp.directorate else None
                },
                'department': {
                    'id': emp.department.id if emp.department else None,
                    'name': emp.department.name if emp.department else None
                },
                'retirement_date': get_employee_retirement_date(emp),
                'past_retirement_date': display_action(get_employee_retirement_date(emp))
            }
            employees_turning_sixty_in_four_months.append(emp_object)
        
        sorted_employees = sorted(
            employees_turning_sixty_in_four_months, key=get_retirement_date)

        employees_due_for_promotion = (
            Employee.query
            .options(joinedload(Employee.directorate))
            .options(joinedload(Employee.rank))
            .join(Rank)
            .options(joinedload(Employee.department)) 
            .options(joinedload(Employee.unit))
            .filter(
                (
                    (
                        Rank.level != 17
                    )&
                    (
                       Rank.level < 15
                    )&
                    (
                        (((func.datediff(current_date, Employee.last_promotion_date)) / 365.25)) >= 3
                    )|
                    (
                        Rank.level != 17
                    )&
                    (
                        Rank.level >= 15
                    )&
                    (
                        (((func.datediff(current_date, Employee.last_promotion_date)) / 365.25)) >= 4
                    )
                )
            )
            .limit(5)
            .all()
        )

        due_for_promotion = []
        
        for employee in employees_due_for_promotion:
            emp_object = {
                'id': employee.id,
                'employee': {
                    'pf_num': employee.pf_num,
                    'first_name': employee.first_name,
                    'last_name': employee.last_name,
                    'middle_name': employee.middle_name,
                    'photo': employee.photo
                },
                'promotion_due_date': get_employee_promotion_date(employee),
                'directorate': {
                    'id': employee.directorate.id if employee.directorate else None,
                    'name': employee.directorate.name if employee.directorate else None
                },
                'department': {
                    'id': employee.department.id if employee.department else None,
                    'name': employee.department.name if employee.department else None
                },
                'unit': {
                    'id': employee.unit.id if employee.unit else None,
                    'name': employee.unit.name if employee.unit else None
                },
            }
            
            due_for_promotion.append(emp_object)
            
        four_months_from_now = current_date + timedelta(days=4 * 30)  # Assuming a month has 30 days
        posting_due_for_return = (
            EmployeePosting.query
            .options(joinedload(EmployeePosting.employee))
            .options(joinedload(EmployeePosting.region))
            .options(joinedload(EmployeePosting.station))
            .filter(
                (func.datediff(four_months_from_now, EmployeePosting.expected_date_of_return) >= 0) &
                (EmployeePosting.status != 2) &
                (EmployeePosting.posting_type != 4)
            )
            .limit(5)
            .all()
        )
        
        due_for_return_posting = []
        for posting in posting_due_for_return:
            posting_object = {
                'id': posting.id,
                'employee': {
                    'pf_num': posting.employee.pf_num,
                    'first_name': posting.employee.first_name,
                    'last_name': posting.employee.last_name,
                    'middle_name': posting.employee.middle_name,
                    'photo':posting.employee.photo
                },
                'department': {
                    'id': posting.employee.department.id if posting.employee.department else None,
                    'name': posting.employee.department.name if posting.employee.department else None
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
         
        # Gender analysis
        gender_subquery = (
            db.session.query(Employee.gender_id, func.count(
                Employee.id).label('employee_count'))
            .filter(Employee.employment_status == 0)
            .group_by(Employee.gender_id)
            .subquery()
        )

        # Use the subquery in the main query to left join Cadre with the employee count
        gender_with_employee_count = (
            db.session.query(Gender.name, func.coalesce(
                gender_subquery.c.employee_count, 0).label('employee_count'))
            .outerjoin(gender_subquery, Gender.id == gender_subquery.c.gender_id)
            .all()
        )
        analysis_by_gender = [count for _,
                              count in gender_with_employee_count]
        
        region_subquery = (
            db.session.query(EmployeePosting.region_id, func.count(
                EmployeePosting.id).label('employee_count'))
            .filter(
                (EmployeePosting.status == 1)|
                (EmployeePosting.status == 3)
            )
            .group_by(EmployeePosting.region_id)
            .subquery()
        )

        region_with_employee_count = (
            db.session.query(Region.code, func.coalesce(
                region_subquery.c.employee_count, 0).label('employee_count'))
            .outerjoin(region_subquery, Region.id == region_subquery.c.region_id)
            .filter(region_subquery.c.region_id.isnot(None))
            .all()
        )

        region_names_list = [region.code for region in Region.query.join(region_subquery, Region.id == region_subquery.c.region_id).all()]
        region_categories = region_names_list
        employee_in_region_counts = [count for _, count in region_with_employee_count]
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "first_name": encrypt(g.user["first_name"]) if hasattr(g, "user") else None,
            "last_name": encrypt(g.user["last_name"]) if hasattr(g, "user") else None,
            "pfs_num": encrypt(g.user["pfs_num"]) if hasattr(g, "user") else None,
            "event": encrypt("view_dashboard"),
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": encrypt(request.url),
            "ip_address": encrypt(request.remote_addr),
            "user_agent": encrypt(request.user_agent.string),
            "tags": encrypt("Employee, Dashboard"),
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        
        response = {
            'status': 'success',
            'directorate_count': directorate_count,
            'department_count': department_count,
            'employee_count': employee_count,
            'retiring_in_four_months': sorted_employees[:5],
            'employee_vs_retiring_in_directorate': employee_vs_retiring_in_directorate,
            'employee_vs_retiring_in_directorate_category': categories,
            'due_for_promotion': due_for_promotion,
            'deployment_count': employee_deployment_count,
            'cadre_categories': cadre_categories,
            'employee_in_cadre': cadre_employee_vs_retiring_in_directorate,
            'due_for_return_posting': due_for_return_posting,
            'analysis_by_gender': analysis_by_gender[::-1],
            'analysis_by_region': {
                'region_names': region_categories,
                'employee_count': employee_in_region_counts
            }
        }
        return jsonify(response), 200
    except Exception as e:
        error_response = {
            'status': 'error',
            'message': str(e)
        }
        return jsonify(error_response), 500