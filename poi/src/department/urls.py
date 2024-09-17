from flask import request


from ..app import app
from .controllers import add_department, get_departments, get_department, delete_department, restore_department, edit_department

@app.route("/departments", methods=['GET', 'POST'])
def list_create_departments():
    if request.method == 'GET': return get_departments()
    if request.method == 'POST': return add_department()
    else: return 'Method is Not Allowed'

@app.route("/department/<department_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_departments(department_id):
    if request.method == 'GET': return get_department(department_id)
    if request.method == 'PUT': return edit_department(department_id)
    if request.method == 'DELETE': return delete_department(department_id)
    else: return 'Method is Not Allowed'
    
@app.route("/department/restore/<department_id>", methods=['GET'])
def restore_department_(department_id):
    if request.method == 'GET': return restore_department(department_id)
    else: return 'Method is Not Allowed'


