from flask import request

from ..app import app
from .controllers import add_module, list_modules, get_module, edit_module, delete_module, seed_data, restore_module

@app.route("/modules", methods=['GET', 'POST'])
def list_create_modules():
    if request.method == 'GET': return list_modules()
    if request.method == 'POST': return add_module()
    else: return 'Method is Not Allowed'

@app.route("/modules/<module_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_modules(module_id):
    if request.method == 'GET': return get_module(module_id)
    if request.method == 'PUT': return edit_module(module_id)
    if request.method == 'DELETE': return delete_module(module_id)
    else: return 'Method is Not Allowed'

@app.route("/module/restore/<module_id>", methods=['GET'])
def restore_single_module(module_id):
    if request.method == 'GET': return restore_module(module_id)
    else: return 'Method is Not Allowed'