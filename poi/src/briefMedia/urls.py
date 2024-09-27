from flask import request

from ..app import app
from .controllers import add_brief_media, get_all_media, get_brief_media, get_media, edit_media, delete_media, restore_media
from .models import BriefMedia


@app.route("/brief-media", methods=['GET', 'POST'])
def list_brief_medias():
   if request.method == 'GET': return get_all_media()
   return 'Method is Not Allowed'

@app.route("/brief-medias/<brief_id>", methods=['GET', 'POST'])
def list_brief_media(brief_id):
   if request.method == 'GET': return get_brief_media(brief_id)
   if request.method == 'POST': return add_brief_media(brief_id)
   else: return 'Method is Not Allowed'

@app.route("/brief-media/<media_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_brief_medias(media_id):
   if request.method == 'GET': return get_media(media_id)
   if request.method == 'PUT': return edit_media(media_id)
   if request.method == 'DELETE': return delete_media(media_id)
   else: return 'Method is Not Allowed'

@app.route("/brief-media/restore/<media_id>", methods=['GET'])
def restore_single_brief_media(media_id):
   if request.method == 'GET': return restore_media(media_id)
   else: return 'Method is Not Allowed'