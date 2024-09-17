from flask import request

from ..app import app
from .controllers import *
from .models import Lga


@app.route("/lgas", methods=['GET', 'POST'])
def list_lgas():
   if request.method == 'GET': return get_lgas()
   return 'Method is Not Allowed'

@app.route("/lgas/<state_id>", methods=['GET'])
def retrieve_lga_by_state(state_id):
    if request.method == 'GET': return get_lgas_by_state(state_id)
    else: return 'Method is Not Allowed'

@app.route("/seed-lgas", methods=['GET'])
def seed_lga_data():
    if request.method == 'GET': return Lga.create_seed_data()
    else: return 'Method is Not Allowed'

