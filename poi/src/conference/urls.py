from flask import request

from .controllers import get_conferences, add_conference, get_conference, edit_conference, delete_conference, \
    search_conferences
from ..app import app



@app.route("/conferences", methods=['GET', 'POST'])
def list_conferences():
   if request.method == 'GET': return get_conferences()
   if request.method == 'POST':return add_conference()
   else:
      return 'Method is Not Allowed'

@app.route("/conferences/<conference_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_conferences(conference_id):
    if request.method == 'GET': return get_conference(conference_id)
    if request.method == 'PUT': return edit_conference(conference_id)
    if request.method == 'DELETE': return delete_conference(conference_id)
    else: return 'Method is Not Allowed'

@app.route("/search_conferences", methods=['GET'])
def search_conferences_route():
    return search_conferences()

