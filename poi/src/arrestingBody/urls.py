from flask import request

from ..app import app
from .controllers import add_arresting_body, get_arresting_bodies, get_arresting_body, edit_arresting_body, delete_arresting_body, restore_arresting_body, list_arresting_bodies
from .models import ArrestingBody


@app.route("/list-arresting_bodies", methods=['GET'])
def get_list_arresting_bodys():
    if request.method == 'GET': return list_arresting_bodies()
    else: return 'Method is Not Allowed'
    
@app.route("/arresting_bodies", methods=['GET', 'POST'])
def get_add_arresting_bodys():
    if request.method == 'GET': return get_arresting_bodies()
    if request.method == 'POST': return add_arresting_body()
    else: return 'Method is Not Allowed'

@app.route("/arresting_bodies/<arresting_body_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_arresting_bodys(arresting_body_id):
    if request.method == 'GET': return get_arresting_body(arresting_body_id)
    if request.method == 'PUT': return edit_arresting_body(arresting_body_id)
    if request.method == 'DELETE': return delete_arresting_body(arresting_body_id)
    else: return 'Method is Not Allowed'

@app.route("/arresting_body/restore/<arresting_body_id>", methods=['GET'])
def restore_single_arresting_body(arresting_body_id):
    if request.method == 'GET': return restore_arresting_body(arresting_body_id)
    else: return 'Method is Not Allowed'
