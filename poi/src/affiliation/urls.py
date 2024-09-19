from flask import request

from ..app import app
from .controllers import get_affiliations
from .models import Affiliation


@app.route("/affiliations", methods=['GET', 'POST'])
def list_affiliations():
   if request.method == 'GET': return get_affiliations()
   return 'Method is Not Allowed'
