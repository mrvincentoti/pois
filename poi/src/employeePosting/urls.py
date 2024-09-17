from flask import request

from .controllers import *
from ..app import app



@app.route("/employee-postings", methods=['GET', 'POST'])
def list_create_employee_posting():
    if request.method == 'GET': return get_employee_postings()
    if request.method == 'POST': return add_employee_posting()
    else: return 'Method is Not Allowed'
    
@app.route("/employee-postings/<int:posting_id>", methods=['GET','PUT','DELETE'])
def list_update_employee_posting(posting_id):
    if request.method == 'GET': return get_employee_posting(posting_id)
    if request.method == 'PUT': return update_employee_posting(posting_id)
    if request.method == 'DELETE': return delete_employee_posting(posting_id)
    else: return 'Method is Not Allowed'
    
@app.route("/employee-postings/employee/<int:employee_id>", methods=['GET'])
def list_all_employee_posting(employee_id):
    if request.method == 'GET': return get_postings_for_employee(employee_id)
    else: return 'Method is Not Allowed'
    
@app.route("/employee-posting/restore/<posting_id>", methods=['GET'])
def restore_posting_(posting_id):
    if request.method == 'GET': return restore_employee_posting(posting_id)
    else: return 'Method is Not Allowed'
    
@app.route("/employee-posting/filter", methods=['GET'])
def filter_employee_posting():
    if request.method == 'GET': return filter_employee_postings()
    else: return 'Method is Not Allowed'
    

@app.route("/employee-posting/action/<int:posting_id>", methods=['POST'])
def action_employee_posting(posting_id):
    if request.method == 'POST':
        return posting_action(posting_id=posting_id)
    else:
        return 'Method is Not Allowed'


@app.route("/returning-from-posting-in-four-months", methods=['GET'])
def returning_in_four_months_():
    if request.method == 'GET':
        return returning_from_post_in_four_months()
    else:
        return 'Method is Not Allowed'

@app.route("/posting-bulk-upload", methods=['POST'])
def posting_bulk_upload_():
    if request.method == 'POST':
        return bulk_upload_posting()
    else:
        return 'Method is Not Allowed'

