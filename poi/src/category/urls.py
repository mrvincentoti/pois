from flask import request

from ..app import app
from .controllers import add_category, get_categories, get_poi_categories, get_org_categories, get_category, edit_category, delete_category,restore_category
from .models import Category


@app.route("/categories", methods=['GET', 'POST'])
def list_categories():
    if request.method == 'GET': return get_categories()
    if request.method == 'POST': return add_category()
    else: return 'Method is Not Allowed'

@app.route("/poi-categories", methods=['GET'])
def list_poi_categories():
    if request.method == 'GET': return get_poi_categories()
    else: return 'Method is Not Allowed'

@app.route("/org-categories", methods=['GET'])
def list_org_categories():
    if request.method == 'GET': return get_org_categories()
    else: return 'Method is Not Allowed'
    
@app.route("/categories/<category_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_categorys(category_id):
    if request.method == 'GET': return get_category(category_id)
    if request.method == 'PUT': return edit_category(category_id)
    if request.method == 'DELETE': return delete_category(category_id)
    else: return 'Method is Not Allowed'

@app.route("/category/restore/<category_id>", methods=['GET'])
def restore_single_category(category_id):
    if request.method == 'GET': return restore_category(category_id)
    else: return 'Method is Not Allowed'
