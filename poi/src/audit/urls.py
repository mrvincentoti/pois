from flask import request

from .controllers import get_audit, get_all_audits, filter_audit
from ..app import app


@app.route("/audits", methods=['GET', 'POST'])
def list_create_audit():
    if request.method == 'GET':
        return get_all_audits()
    else:
        return 'Method is Not Allowed'

@app.route("/audits/<audit_id>", methods=['GET'])
def retrieve_update_destroy_audits(audit_id):
    if request.method == 'GET':
        return get_audit(audit_id)
    else:
        return 'Method is Not Allowed'
    
@app.route("/audits/filter", methods=['GET'])
def filter_audit_trial():
    if request.method == 'GET':
        return filter_audit()
    else:
        return 'Method is Not Allowed'
