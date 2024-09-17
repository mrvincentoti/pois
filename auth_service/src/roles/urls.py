from flask import request


from ..app import app
from .controllers import add_role, list_roles, get_role, edit_role, delete_role, seed_data


@app.route("/roles", methods=['GET', 'POST'])
def list_create_roles():
    if request.method == 'GET': return list_roles()
    if request.method == 'POST': return add_role()
    else: return 'Method is Not Allowed'

@app.route("/roles/<role_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_roles(role_id):
    if request.method == 'GET': return get_role(role_id)
    if request.method == 'PUT': return edit_role(role_id)
    if request.method == 'DELETE': return delete_role(role_id)
    else: return 'Method is Not Allowed'
    


