from flask import request
import redis
import json

from ..app import app
from .controllers import *

redis_client = redis.StrictRedis(host='redis', port=6379, decode_responses=True)


@app.route("/states", methods=['GET'])
def list_states():
   if request.method == 'GET': return get_states()
   return 'Method is Not Allowed'


@app.route('/states/redis/subscribe', methods=['POST'])
def add_data():
    data = request.json
    payload = {
         "email": data.get('email'),
         "username": data.get('username'),
         "password": data.get('password'),
         "role_id": 1,
   }

    # Publish data to Redis channel
    redis_client.publish('alpha', json.dumps(payload))

    return 'Data added and sent to Service B'

