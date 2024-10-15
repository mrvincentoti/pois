from flask import request

from ..app import app
from .controllers import get_items_by_poi
from .models import ActivityItem

@app.route("/poi-items/<poi_id>", methods=['GET'])
def poi_items(poi_id):
   if request.method == 'GET': return get_items_by_poi(poi_id)
   else: return 'Method is Not Allowed'  
