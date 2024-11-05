from flask import request

from ..app import app
from .controllers import add_affiliation, get_affiliations, get_affiliation, edit_affiliation, delete_affiliation, restore_affiliation, list_affiliations
from .models import Affiliation


@app.route("/list-affiliations", methods=['GET'])
def get_list_affiliations():
   if request.method == 'GET': return list_affiliations()
   else: return 'Method is Not Allowed'
   
@app.route("/affiliations", methods=['GET', 'POST'])
def get_add_affiliations():
   if request.method == 'GET': return get_affiliations()
   if request.method == 'POST': return add_affiliation()
   else: return 'Method is Not Allowed'

@app.route("/affiliations/<affiliation_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_affiliations(affiliation_id):
   if request.method == 'GET': return get_affiliation(affiliation_id)
   if request.method == 'PUT': return edit_affiliation(affiliation_id)
   if request.method == 'DELETE': return delete_affiliation(affiliation_id)
   else: return 'Method is Not Allowed'

@app.route("/affiliation/restore/<affiliation_id>", methods=['GET'])
def restore_single_affiliation(affiliation_id):
   if request.method == 'GET': return restore_affiliation(affiliation_id)
   else: return 'Method is Not Allowed'
