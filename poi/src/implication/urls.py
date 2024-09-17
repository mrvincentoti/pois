from flask import request

from ..app import app
from .controllers import *


@app.route("/implication/seed", methods=['GET'])
def seed_implication_data():
    if request.method == 'GET': return seed_data()
    else: return 'Method is Not Allowed'

@app.route("/implications", methods=['GET', 'POST'])
def list_implication():
   if request.method == 'GET': return list_implications()
   return 'Method is Not Allowed'