from flask import request


from ..app import app
from .controllers import add_specialty, get_specialties, list_all_specialties, get_specialty, delete_specialty, restore_specialty, edit_specialty, post_message, get_message


@app.route("/specialties", methods=['GET', 'POST'])
def list_create_specialties():
    if request.method == 'GET': return get_specialties()
    if request.method == 'POST': return add_specialty()
    else: return 'Method is Not Allowed'

@app.route("/all-specialties", methods=['GET'])
def get_all_specialties():
    if request.method == 'GET': return list_all_specialties()
    else: return 'Method is Not Allowed'

@app.route("/specialty/<specialty_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_specialties(specialty_id):
    if request.method == 'GET': return get_specialty(specialty_id)
    if request.method == 'PUT': return edit_specialty(specialty_id)
    if request.method == 'DELETE': return delete_specialty(specialty_id)
    else: return 'Method is Not Allowed'
    
@app.route("/specialty/restore/<specialty_id>", methods=['GET'])
def restore_specialty_(specialty_id):
    if request.method == 'GET': return restore_specialty(specialty_id)
    else: return 'Method is Not Allowed'

@app.route("/specialties/rabbitmq", methods=['GET','POST'])
def get_create_queue_():
    if request.method == 'POST': return post_message()
    else: return get_message()
