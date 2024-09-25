from flask import request

from ..app import app
from .controllers import add_activity, get_activities, get_activity, edit_activity, delete_activity, restore_activity, get_activities_by_poi
from .models import Activity

@app.route("/activities", methods=['GET', 'POST'])
def list_activities():
   if request.method == 'GET': return get_activities()
   if request.method == 'POST': return add_activity()
   else: return 'Method is Not Allowed'

@app.route("/activities/<activity_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_activities(activity_id):
   if request.method == 'GET': return get_activity(activity_id)
   if request.method == 'PUT': return edit_activity(activity_id)
   if request.method == 'DELETE': return delete_activity(activity_id)
   else: return 'Method is Not Allowed'

@app.route("/activity/restore/<activity_id>", methods=['GET'])
def restore_single_activity(activity_id):
   if request.method == 'GET': return restore_activity(activity_id)
   else: return 'Method is Not Allowed'

@app.route("/poi-activities/<poi_id>", methods=['GET'])
def poi_activities(poi_id):
   if request.method == 'GET': return get_activities_by_poi(poi_id)
   else: return 'Method is Not Allowed'  
