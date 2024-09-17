from flask import request


from ..app import app
from .controllers import *

@app.route("/stations", methods=['GET'])
def get_stations_by_region_():
   if request.method == 'GET': return get_stations_by_region()
   return 'Method is Not Allowed'
