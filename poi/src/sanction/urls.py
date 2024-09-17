from flask import request


from ..app import app
from .controllers import add_sanction, list_sanctions, get_sanction, edit_sanction, delete_sanction, restore_sanction


@app.route("/sanctions", methods=['GET', 'POST'])
def list_create_sanctions():
    if request.method == 'GET': return list_sanctions()
    if request.method == 'POST': return add_sanction()
    else: return 'Method is Not Allowed'

@app.route("/sanction/<sanction_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_sanctions(sanction_id):
    if request.method == 'GET': return get_sanction(sanction_id)
    if request.method == 'PUT': return edit_sanction(sanction_id)
    if request.method == 'DELETE': return delete_sanction(sanction_id)
    else: return 'Method is Not Allowed'
    
@app.route("/sanction/restore/<sanction_id>", methods=['GET'])
def restore_sanction_(sanction_id):
    if request.method == 'GET': return restore_sanction(sanction_id)
    else: return 'Method is Not Allowed'