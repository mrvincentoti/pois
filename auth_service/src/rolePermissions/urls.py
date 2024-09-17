from flask import request

from ..app import app
from .controllers import get_role_permissions, add_role_premission, get_role_permission_by_module, get_role_permission, \
    delete_role_permission_by_module


@app.route("/role-permissions", methods=['GET', 'POST'])
def list_create_rols():
    if request.method == 'GET': return get_role_permissions()
    else: return 'Method is Not Allowed'


@app.route("/roles/<role_id>/permissions", methods=['GET','POST', 'PUT', 'DELETE'])
def retrieve_roles_permissions(role_id):
    if request.method == 'GET': return get_role_permission(role_id)
    if request.method == 'POST': return add_role_premission(role_id)
    else: return 'Method is Not Allowed'


@app.route("/roles/<role_id>/modules/<module_id>/permissions", methods=['GET'])
def retrieve_roles_permissions_by_module(role_id, module_id):
    if request.method == 'GET': return get_role_permission_by_module(role_id, module_id)
    else: return 'Method is Not Allowed'

@app.route("/roles/<role_id>/modules/<module_id>/permissions/<permission_id>", methods=['DELETE'])
def delete_roles_permissions_by_module_by_permission(role_id, module_id, permission_id):
    if request.method == 'DELETE': return delete_role_permission_by_module(role_id, module_id, permission_id)
    else: return 'Method is Not Allowed'