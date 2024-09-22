from flask import request

from ..app import app
from .controllers import add_poi_media, get_medias, get_poi_medias, get_media, edit_media, delete_media,restore_media
from .models import PoiMedia


@app.route("/medias", methods=['GET', 'POST'])
def list_medias():
   if request.method == 'GET': return get_medias()
   return 'Method is Not Allowed'

@app.route("/poi-medias/<poi_id>", methods=['GET', 'POST'])
def list_poi_medias(poi_id):
   if request.method == 'GET': return get_poi_medias(poi_id)
   if request.method == 'POST': return add_poi_media(poi_id)
   else: return 'Method is Not Allowed'

@app.route("/medias/<media_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_medias(media_id):
    if request.method == 'GET': return get_media(media_id)
    if request.method == 'PUT': return edit_media(media_id)
    if request.method == 'DELETE': return delete_media(media_id)
    else: return 'Method is Not Allowed'

@app.route("/media/restore/<media_id>", methods=['GET'])
def restore_single_media(media_id):
    if request.method == 'GET': return restore_media(media_id)
    else: return 'Method is Not Allowed'