from flask import request
from ..app import app
from .controllers import add_next_of_kin, list_noks, get_nok, update_nok, delete_nok, restore_nok, list_employee_noks, bulk_upload_nok

@app.route("/nok/<employee_id>", methods=['POST'])
def add_nok(employee_id):
    if request.method == 'POST':
        return add_next_of_kin(employee_id)
    else:
        return 'Method is Not Allowed'

@app.route("/nok/<employee_id>", methods=['GET'])
def get_nok_(employee_id):
    if request.method == 'GET':
        return list_noks(employee_id)
    else:
        return 'Method is Not Allowed'
    
@app.route("/nok", methods=['GET'])
def get_noks_():
    if request.method == 'GET':
        return list_employee_noks()
    else:
        return 'Method is Not Allowed'

@app.route("/nok/<nok_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_nok(nok_id):
    if request.method == 'GET':
        return get_nok(nok_id)
    elif request.method == 'PUT':
        return update_nok(nok_id)
    elif request.method == 'DELETE':
        return delete_nok(nok_id)
    else:
        return 'Method is Not Allowed'

@app.route("/nok/restore/<nok_id>", methods=['GET'])
def restore_nok_(nok_id):
    if request.method == 'GET':
        return restore_nok(nok_id)
    else:
        return 'Method is Not Allowed'
    
    
@app.route("/nok-bulk-upload", methods=['POST'])
def nok_bulk_upload_():
    if request.method == 'POST':
        return bulk_upload_nok()
    else:
        return 'Method is Not Allowed'