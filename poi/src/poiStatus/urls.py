from flask import request
from ..app import app
from .controllers import (
    create_poi_status, get_poi_statuses, get_poi_status, update_poi_status, delete_poi_status
)

@app.route("/poi_statuses", methods=['GET', 'POST'])
def poi_statuses_list_create():
    if request.method == 'GET':
        return get_poi_statuses()
    if request.method == 'POST':
        return create_poi_status()
    else:
        return 'Method Not Allowed', 405

@app.route("/poi_status/<int:status_id>", methods=['GET', 'PUT', 'DELETE'])
def poi_status_detail_update_delete(status_id):
    if request.method == 'GET':
        return get_poi_status(status_id)
    elif request.method == 'PUT':
        return update_poi_status(status_id)
    elif request.method == 'DELETE':
        return delete_poi_status(status_id)
    else:
        return 'Method Not Allowed', 405
