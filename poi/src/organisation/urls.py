from flask import request
from ..app import app
from .controllers import (
    create_organisation, get_organisations, get_organisation, update_organisation, delete_organisation, restore_organisation
)

@app.route("/organisations", methods=['GET', 'POST'])
def organisations_list_create():
    if request.method == 'GET': return get_organisations()
    if request.method == 'POST': return create_organisation()
    else: return 'Method is Not Allowed'

@app.route("/organisation/<int:organisation_id>", methods=['GET', 'PUT', 'DELETE'])
def organisation_detail_update_delete(organisation_id):
    if request.method == 'GET':
        return get_organisation(organisation_id)
    elif request.method == 'PUT':
        return update_organisation(organisation_id)
    elif request.method == 'DELETE':
        return delete_organisation(organisation_id)

@app.route("/organisation/<int:organisation_id>/restore", methods=['GET'])
def organisation_restore(organisation_id):
    return restore_organisation(organisation_id)