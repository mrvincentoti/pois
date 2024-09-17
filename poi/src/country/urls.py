from flask import request


from ..app import app
from .controllers import *

@app.route("/countries", methods=['GET'])
def list_countries():
    if request.method == 'GET': return get_countries()
    return 'Method is Not Allowed'