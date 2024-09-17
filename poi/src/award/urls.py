from flask import request

from .controllers import get_awards, add_award, get_award, edit_award, delete_award
from ..app import app



@app.route("/awards", methods=['GET', 'POST'])
def list_create_award():
    if request.method == 'GET': return get_awards()
    if request.method == 'POST': return add_award()
    else: return 'Method is Not Allowed'

@app.route("/awards/<award_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_awards(award_id):
    if request.method == 'GET': return get_award(award_id)
    if request.method == 'PUT': return edit_award(award_id)
    if request.method == 'DELETE': return delete_award(award_id)
    else: return 'Method is Not Allowed'


