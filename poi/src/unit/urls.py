from flask import request

from .controllers import get_units, add_unit, get_unit, edit_unit, delete_unit
from ..app import app


@app.route("/units", methods=['GET', 'POST'])
def list_units():
   if request.method == 'GET': return get_units()
   if request.method == 'POST':return add_unit()
   else:
      return 'Method is Not Allowed'

@app.route("/units/<unit_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_units(unit_id):
    if request.method == 'GET': return get_unit(unit_id)
    if request.method == 'PUT': return edit_unit(unit_id)
    if request.method == 'DELETE': return delete_unit(unit_id)
    else: return 'Method is Not Allowed'


# @app.route("/directorates/<directorate_id>", methods=['GET', 'PUT', 'DELETE'])
# def retrieve_update_destroy_directorates(directorate_id):
#     if request.method == 'GET': return get_role(directorate_id)
#     if request.method == 'PUT': return edit_role(directorate_id)
#     if request.method == 'DELETE': return delete_role(directorate_id)
#     else: return 'Method is Not Allowed'


