from flask import request


from ..app import app
from .controllers import add_directorate, get_directorates, get_directorate, delete_directorate, restore_directorate, edit_directorate


@app.route("/directorates", methods=['GET', 'POST'])
def list_create_directorates():
    if request.method == 'GET': return get_directorates()
    if request.method == 'POST': return add_directorate()
    else: return 'Method is Not Allowed'

@app.route("/directorate/<directorate_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_directorates(directorate_id):
    if request.method == 'GET': return get_directorate(directorate_id)
    if request.method == 'PUT': return edit_directorate(directorate_id)
    if request.method == 'DELETE': return delete_directorate(directorate_id)
    else: return 'Method is Not Allowed'
    
@app.route("/directorate/restore/<directorate_id>", methods=['GET'])
def restore_directorate_(directorate_id):
    if request.method == 'GET': return restore_directorate(directorate_id)
    else: return 'Method is Not Allowed'

