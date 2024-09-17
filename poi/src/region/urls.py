from flask import request


from ..app import app
from .controllers import *

@app.route("/regions", methods=['GET'])
def list_regions():
   if request.method == 'GET': return get_regions()
   return 'Method is Not Allowed'
