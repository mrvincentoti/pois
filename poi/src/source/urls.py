from flask import request

from ..app import app
from .controllers import add_source, get_sources, get_source, edit_source, delete_source, restore_source, list_sources
from .models import Source


@app.route("/list-sources", methods=['GET'])
def get_list_sources():
   if request.method == 'GET': return list_sources()
   else: return 'Method is Not Allowed'
   
@app.route("/sources", methods=['GET', 'POST'])
def get_add_sources():
   if request.method == 'GET': return get_sources()
   if request.method == 'POST': return add_source()
   else: return 'Method is Not Allowed'

@app.route("/sources/<source_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_sources(source_id):
    if request.method == 'GET': return get_source(source_id)
    if request.method == 'PUT': return edit_source(source_id)
    if request.method == 'DELETE': return delete_source(source_id)
    else: return 'Method is Not Allowed'

@app.route("/source/restore/<source_id>", methods=['GET'])
def restore_single_source(source_id):
    if request.method == 'GET': return restore_source(source_id)
    else: return 'Method is Not Allowed'
