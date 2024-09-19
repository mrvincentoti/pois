from flask import request

from ..app import app
from .controllers import get_arms
from .models import Arms


@app.route("/arms", methods=['GET', 'POST'])
def list_arms():
   if request.method == 'GET': return get_arms()
   return 'Method is Not Allowed'
