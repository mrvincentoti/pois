from flask import request

from ..app import app
from .controllers import add_item, get_items, get_item, edit_item, delete_item, restore_item, list_items


@app.route("/list-arms", methods=['GET'])
def get_list_items():
   if request.method == 'GET': return list_items()
   else: return 'Method is Not Allowed'

@app.route("/arms", methods=['GET', 'POST'])
def get_add_items():
   if request.method == 'GET': return get_items()
   if request.method == 'POST': return add_item()
   else: return 'Method is Not Allowed'

@app.route("/arms/<item_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_items(item_id):
    if request.method == 'GET': return get_item(item_id)
    if request.method == 'PUT': return edit_item(item_id)
    if request.method == 'DELETE': return delete_item(item_id)
    else: return 'Method is Not Allowed'

@app.route("/arm/restore/<item_id>", methods=['GET'])
def restore_single_item(item_id):
    if request.method == 'GET': return restore_item(item_id)
    else: return 'Method is Not Allowed'
