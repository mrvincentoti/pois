from flask import request

from ..app import app
from .controllers import create_operational_capacity, get_operational_capacity_by_org, update_operational_capacity, delete_operational_capacity, restore_operational_capacity

@app.route("/operational-capacities", methods=['POST'])
def add_get_operational_capacities():
   if request.method == 'POST': return create_operational_capacity()
   else: return 'Method is Not Allowed'

@app.route("/operational-capacities/<operational_capacity_id>", methods=['PUT', 'DELETE'])
def retrieve_update_destroy_operational_capacities(operational_capacity_id):
   if request.method == 'PUT': return update_operational_capacity(operational_capacity_id)
   if request.method == 'DELETE': return delete_operational_capacity(operational_capacity_id)
   else: return 'Method is Not Allowed'

@app.route("/operational-capacity/restore/<operational_capacity_id>", methods=['GET'])
def restore_single_operational_capacity(operational_capacity_id):
   if request.method == 'GET': return restore_operational_capacity(operational_capacity_id)
   else: return 'Method is Not Allowed'

@app.route("/org-operational-capacities/<org_id>", methods=['GET'])
def org_operational_capacities(org_id):
   if request.method == 'GET': return get_operational_capacity_by_org(org_id)
   else: return 'Method is Not Allowed'  