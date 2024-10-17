from flask import request

from ..app import app
from .controllers import add_activity, get_activities, get_activity, edit_activity, delete_activity, restore_activity, get_activities_by_poi

@app.route("/org-activities", methods=['GET', 'POST'])
def org_list_activities():
   if request.method == 'GET': return get_activities()
   if request.method == 'POST': return add_activity()
   else: return 'Method is Not Allowed'

@app.route("/org-activities/<activity_id>", methods=['GET', 'PUT', 'DELETE'])
def org_retrieve_update_destroy_activities(activity_id):
   if request.method == 'GET': return get_activity(activity_id)
   if request.method == 'PUT': return edit_activity(activity_id)
   if request.method == 'DELETE': return delete_activity(activity_id)
   else: return 'Method is Not Allowed'

@app.route("/org-activity/restore/<activity_id>", methods=['GET'])
def org_restore_single_activity(activity_id):
   if request.method == 'GET': return restore_activity(activity_id)
   else: return 'Method is Not Allowed'

@app.route("/org-activities/<org_id>", methods=['GET'])
def org_activities(org_id):
   if request.method == 'GET': return get_activities_by_poi(org_id)
   else: return 'Method is Not Allowed'  
