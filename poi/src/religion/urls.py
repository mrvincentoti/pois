from flask import request

from ..app import app
from .controllers import get_religions
from .models import Religion


@app.route("/religions", methods=['GET', 'POST'])
def list_religions():
   if request.method == 'GET': return get_religions()
   return 'Method is Not Allowed'

@app.route("/seed-religions", methods=['GET'])
def seed_religion_data():
    if request.method == 'GET': return Religion.create_seed_data()
    else: return 'Method is Not Allowed'
