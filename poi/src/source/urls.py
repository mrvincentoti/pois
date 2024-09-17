from flask import request

from ..app import app
from .controllers import get_sources
from .models import Source


@app.route("/sources", methods=['GET', 'POST'])
def list_sources():
   if request.method == 'GET': return get_sources()
   return 'Method is Not Allowed'
