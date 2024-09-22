from flask import request

from ..app import app
from .controllers import add_arm_recovered, get_arms_recovered, get_arm_recovered, edit_arm_recovered, delete_arm_recovered, restore_arm_recovered
from .models import ArmsRecovered

@app.route("/recovered-arms", methods=['GET', 'POST'])
def list_arms_recovered():
   if request.method == 'GET': return get_arms_recovered()
   if request.method == 'POST': return add_arm_recovered()
   else: return 'Method is Not Allowed'

@app.route("/recovered-arms/<recovery_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_arms_recovered(recovery_id):
   if request.method == 'GET': return get_arm_recovered(recovery_id)
   if request.method == 'PUT': return edit_arm_recovered(recovery_id)
   if request.method == 'DELETE': return delete_arm_recovered(recovery_id)
   else: return 'Method is Not Allowed'

@app.route("/recovered-arm/restore/<recovery_id>", methods=['GET'])
def restore_single_arm_recovered(recovery_id):
   if request.method == 'GET': return restore_arm_recovered(recovery_id)
   else: return 'Method is Not Allowed'
