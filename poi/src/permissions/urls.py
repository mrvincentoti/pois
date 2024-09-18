from flask import request

from ..app import app
from .controllers import add_permission, list_permissions, list_all_permissions, get_permission, edit_permission, delete_permission, restore_permission

@app.route("/permissions", methods=['GET', 'POST'])
def list_create_permissions():
    if request.method == 'GET': return list_permissions()
    if request.method == 'POST': return add_permission()
    else: return 'Method is Not Allowed'

@app.route("/all-permissions", methods=['GET', 'POST'])
def fetch_all_permissions():
    if request.method == 'GET': return list_all_permissions()
    else: return 'Method is Not Allowed'

@app.route("/permissions/<permission_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_permissions(permission_id):
    if request.method == 'GET': return get_permission(permission_id)
    if request.method == 'PUT': return edit_permission(permission_id)
    if request.method == 'DELETE': return delete_permission(permission_id)
    else: return 'Method is Not Allowed'

@app.route("/permission/restore/<permission_id>", methods=['GET'])
def restore_single_permission(permission_id):
    if request.method == 'GET': return restore_permission(permission_id)
    else: return 'Method is Not Allowed'