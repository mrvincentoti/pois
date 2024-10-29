from flask import request

from ..app import app
from .controllers import add_item_recovered, get_items_recovered, get_item_recovered, edit_item_recovered, delete_item_recovered, restore_item_recovered, get_items_recovered_by_poi
from .models import ArmsRecovered

@app.route("/recovered-items", methods=['GET', 'POST'])
def list_items_recovered():
   if request.method == 'GET': return get_items_recovered()
   if request.method == 'POST': return add_item_recovered()
   else: return 'Method is Not Allowed'

@app.route("/recovered-items/<recovery_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_items_recovered(recovery_id):
   if request.method == 'GET': return get_item_recovered(recovery_id)
   if request.method == 'PUT': return edit_item_recovered(recovery_id)
   if request.method == 'DELETE': return delete_item_recovered(recovery_id)
   else: return 'Method is Not Allowed'

@app.route("/recovered-item/restore/<recovery_id>", methods=['GET'])
def restore_single_item_recovered(recovery_id):
   if request.method == 'GET': return restore_item_recovered(recovery_id)
   else: return 'Method is Not Allowed'

@app.route("/poi-recovered-items/<poi_id>", methods=['GET'])
def poi_items_recovered(poi_id):
   if request.method == 'GET': return get_items_recovered_by_poi(poi_id)
   else: return 'Method is Not Allowed'  
