from flask import request

from ..app import app
from .controllers import get_medias
from .models import PoiMedia


@app.route("/medias", methods=['GET', 'POST'])
def list_medias():
   if request.method == 'GET': return get_medias()
   return 'Method is Not Allowed'
