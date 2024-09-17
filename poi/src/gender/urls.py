from flask import request

from ..app import app
from .controllers import get_genders
from .models import Gender


@app.route("/genders", methods=['GET', 'POST'])
def list_genders():
   if request.method == 'GET': return get_genders()
   return 'Method is Not Allowed'

@app.route("/seed-genders", methods=['GET'])
def seed_gender_data():
    if request.method == 'GET': return Gender.create_seed_data()
    else: return 'Method is Not Allowed'
