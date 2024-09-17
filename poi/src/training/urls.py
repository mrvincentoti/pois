from flask import request


from ..app import app
from .controllers import add_training, get_trainings, get_training, delete_training, restore_training, edit_training

@app.route("/trainings", methods=['GET', 'POST'])
def list_create_trainings():
    if request.method == 'GET': return get_trainings()
    if request.method == 'POST': return add_training()
    else: return 'Method is Not Allowed'

@app.route("/training/<training_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_trainings(training_id):
    if request.method == 'GET': return get_training(training_id)
    if request.method == 'PUT': return edit_training(training_id)
    if request.method == 'DELETE': return delete_training(training_id)
    else: return 'Method is Not Allowed'
    
@app.route("/training/restore/<training_id>", methods=['GET'])
def restore_training_(training_id):
    if request.method == 'GET': return restore_training(training_id)
    else: return 'Method is Not Allowed'

