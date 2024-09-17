from flask import request


from ..app import app
from .controllers import add_designation, list_designations, list_all_designations, get_designation, edit_designation, delete_designation, restore_designation


@app.route("/designations", methods=['GET', 'POST'])
def list_create_designations():
    if request.method == 'GET': return list_designations()
    if request.method == 'POST': return add_designation()
    else: return 'Method is Not Allowed'

@app.route("/all-designations", methods=['GET'])
def get_all_designations():
    if request.method == 'GET': return list_all_designations()
    else: return 'Method is Not Allowed'

@app.route("/designation/<designation_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_designations(designation_id):
    if request.method == 'GET': return get_designation(designation_id)
    if request.method == 'PUT': return edit_designation(designation_id)
    if request.method == 'DELETE': return delete_designation(designation_id)
    else: return 'Method is Not Allowed'
    
@app.route("/designation/restore/<designation_id>", methods=['GET'])
def restore_designation_(designation_id):
    if request.method == 'GET': return restore_designation(designation_id)
    else: return 'Method is Not Allowed'