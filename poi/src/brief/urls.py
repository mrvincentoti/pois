from flask import request
from ..app import app
from .controllers import (
    create_brief, get_briefs, get_brief, update_brief, delete_brief, restore_brief
)

@app.route("/briefs", methods=['GET', 'POST'])
def briefs_list_create():
    if request.method == 'GET': return get_briefs()
    if request.method == 'POST': return create_brief()
    else: return 'Method is Not Allowed'

@app.route("/brief/<int:brief_id>", methods=['GET', 'PUT', 'DELETE'])
def brief_detail_update_delete(brief_id):
    if request.method == 'GET':
        return get_brief(brief_id)
    elif request.method == 'PUT':
        return update_brief(brief_id)
    elif request.method == 'DELETE':
        return delete_brief(brief_id)

@app.route("/brief/<int:brief_id>/restore", methods=['GET'])
def brief_restore(brief_id):
    return restore_brief(brief_id)