from flask import request
from ..app import app
from .controllers import (
    create_feedback, get_feedbacks, get_feedback, update_feedback, delete_feedback, restore_feedback
)

@app.route("/feedbacks", methods=['GET', 'POST'])
def feedbacks_list_create():
    if request.method == 'GET': return get_feedbacks()
    if request.method == 'POST': return create_feedback()
    else: return 'Method is Not Allowed'

@app.route("/feedback/<feedback_id>", methods=['GET', 'PUT', 'DELETE'])
def feedback_detail_update_delete(feedback_id):
    if request.method == 'GET':
        return get_feedback(feedback_id)
    elif request.method == 'PUT':
        return update_feedback(feedback_id)
    elif request.method == 'DELETE':
        return delete_feedback(feedback_id)

@app.route("/feedback/<feedback_id>/restore", methods=['GET'])
def feedback_restore(feedback_id):
    return restore_feedback(feedback_id)