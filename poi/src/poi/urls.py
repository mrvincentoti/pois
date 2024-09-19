from flask import request
from ..app import app
from .controllers import create_poi, get_poi, update_poi, delete_poi, restore_poi, list_pois

@app.route("/pois", methods=['GET', 'POST'])
def poi_list_create():
    if request.method == 'GET': return list_pois()
    if request.method == 'POST': return create_poi()
    else: return 'Method is Not Allowed'

@app.route("/pois/<int:poi_id>", methods=['GET', 'PUT', 'DELETE'])
def poi_detail_update_delete(poi_id):
    if request.method == 'GET':
        return get_poi(poi_id)
    elif request.method == 'PUT':
        return update_poi(poi_id)
    elif request.method == 'DELETE':
        return delete_poi(poi_id)

@app.route("/pois/<int:poi_id>/restore", methods=['POST'])
def poi_restore(poi_id):
    return restore_poi(poi_id)