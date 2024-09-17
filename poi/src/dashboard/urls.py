from flask import request


from ..app import app
from .controllers import get_data

@app.route("/dashboard", methods=['GET'])
def list_get_data():
    if request.method == 'GET': return get_data()
    else: return 'Method is Not Allowed'


