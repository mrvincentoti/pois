from flask import request

from ..app import app
from .controllers import add_crime, get_crimes, get_crime, edit_crime, delete_crime,restore_crime
from .models import Crime


@app.route("/crimes", methods=['GET', 'POST'])
def list_crimes():
    if request.method == 'GET': return get_crimes()
    if request.method == 'POST': return add_crime()
    else: return 'Method is Not Allowed'

@app.route("/crimes/<crime_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_crimes(crime_id):
    if request.method == 'GET': return get_crime(crime_id)
    if request.method == 'PUT': return edit_crime(crime_id)
    if request.method == 'DELETE': return delete_crime(crime_id)
    else: return 'Method is Not Allowed'

@app.route("/crime/restore/<crime_id>", methods=['GET'])
def restore_single_crime(crime_id):
    if request.method == 'GET': return restore_crime(crime_id)
    else: return 'Method is Not Allowed'
