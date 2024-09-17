from flask import request

from ..app import app
from .controllers import get_categories
from .models import Category


@app.route("/categories", methods=['GET', 'POST'])
def list_categories():
   if request.method == 'GET': return get_categories()
   return 'Method is Not Allowed'
