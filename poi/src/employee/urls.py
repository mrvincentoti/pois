from flask import request

from .controllers import add_employee, get_employees, delete_employee, get_employee, edit_employee, faker_employee, \
    bulk_upload_employee, upcoming_retirement, check_key
from ..app import app



@app.route("/employees", methods=['GET', 'POST'])
def list_create_employees():
    if request.method == 'GET': return get_employees()
    if request.method == 'POST': return add_employee()
    else: return 'Method is Not Allowed'

@app.route("/employees/<employee_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_employees(employee_id):
    if request.method == 'GET': return get_employee(employee_id)
    if request.method == 'PUT': return edit_employee(employee_id)
    if request.method == 'DELETE': return delete_employee(employee_id)
    else: return 'Method is Not Allowed'
   
@app.route("/faker-employee", methods=['GET'])
def faker_employee_():
    if request.method == 'GET': return faker_employee()
    else:return 'Method is Not Allowed'


@app.route("/retiring-in-four-months", methods=["GET"])
def upcoming_retirement_():
    return upcoming_retirement()

@app.route("/employee-bulk-upload", methods=["POST"])
def employee_upload():
    return bulk_upload_employee()


@app.route("/check", methods=['GET'])
def check_keyd():
    if request.method == 'GET': return check_key()
    else:return 'Method is Not Allowed'
