from flask import request

from ..app import app
from .controllers import add_arm, get_arms, get_arm, edit_arm, delete_arm,restore_arm
from .models import Arm


@app.route("/arms", methods=['GET', 'POST'])
def list_arms():
   if request.method == 'GET': return get_arms()
   if request.method == 'POST': return add_arm()
   else: return 'Method is Not Allowed'

@app.route("/arms/<arm_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_arms(arm_id):
    if request.method == 'GET': return get_arm(arm_id)
    if request.method == 'PUT': return edit_arm(arm_id)
    if request.method == 'DELETE': return delete_arm(arm_id)
    else: return 'Method is Not Allowed'

@app.route("/arm/restore/<arm_id>", methods=['GET'])
def restore_single_arm(arm_id):
    if request.method == 'GET': return restore_arm(arm_id)
    else: return 'Method is Not Allowed'
