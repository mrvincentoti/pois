from flask import request

from ..app import app
from .controllers import add_crime_committed, get_crimes_committed, get_crime_committed, edit_crime_committed, delete_crime_committed, restore_crime_committed, get_crimes_committed_by_poi
from .models import CrimeCommitted


@app.route("/crimes_committed", methods=['GET', 'POST'])
def list_crime_committeds():
    if request.method == 'GET': return get_crimes_committed()
    if request.method == 'POST': return add_crime_committed()
    else: return 'Method is Not Allowed'

@app.route("/crimes_committed/<crime_committed_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_crime_committeds(crime_committed_id):
    if request.method == 'GET': return get_crime_committed(crime_committed_id)
    if request.method == 'PUT': return edit_crime_committed(crime_committed_id)
    if request.method == 'DELETE': return delete_crime_committed(crime_committed_id)
    else: return 'Method is Not Allowed'

@app.route("/crime_committed/restore/<crime_committed_id>", methods=['GET'])
def restore_single_crime_committed(crime_committed_id):
    if request.method == 'GET': return restore_crime_committed(crime_committed_id)
    else: return 'Method is Not Allowed'
    
@app.route("/poi_crimes_committed/<poi_id>", methods=['GET'])
def poi_crimes_committed(poi_id):
    if request.method == 'GET': return get_crimes_committed_by_poi(poi_id)
    else: return 'Method is Not Allowed' 
