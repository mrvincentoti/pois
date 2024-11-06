from flask import request

from ..app import app
from .controllers import add_org_media, get_org_media, get_media, edit_media, delete_media, restore_media
from .models import OrgMedia


@app.route("/org-medias/<org_id>", methods=['GET', 'POST'])
def list_org_media(org_id):
   if request.method == 'GET': return get_org_media(org_id)
   if request.method == 'POST': return add_org_media(org_id)
   else: return 'Method is Not Allowed'

@app.route("/org-media/<media_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_org_medias(media_id):
   if request.method == 'GET': return get_media(media_id)
   if request.method == 'PUT': return edit_media(media_id)
   if request.method == 'DELETE': return delete_media(media_id)
   else: return 'Method is Not Allowed'

@app.route("/org-media/restore/<media_id>", methods=['GET'])
def restore_single_org_media(media_id):
   if request.method == 'GET': return restore_media(media_id)
   else: return 'Method is Not Allowed'