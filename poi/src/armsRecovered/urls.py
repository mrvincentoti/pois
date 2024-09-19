from flask import request

from ..app import app
from .controllers import get_arms_recovered
from .models import ArmsRecovered


@app.route("/recoveries", methods=['GET', 'POST'])
def list_arms_recovered():
   if request.method == 'GET': return get_arms_recovered()
   return 'Method is Not Allowed'
