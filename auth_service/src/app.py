import os
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from .users.models import User
from .roles.models import Role
from .modules.models import Module
from .permissions.models import Permission
# App Initialization
from . import create_app
app = create_app(os.getenv("CONFIG_MODE"))

# Flask-JWT-Extended setup
app.config['JWT_SECRET_KEY'] = os.getenv("SECRET_KEY")
jwt = JWTManager(app)

from .redis_manager import set_token, get_token

# Hello World!
@app.route('/')
def hello():
    return "It works!"

@app.route('/set', methods=['POST'])
def set_value():
    # data = request.get_json()
    # key = data.get('key')
    # value = data.get('value')
    # # set_token(key, value)
    return jsonify({'message': 'Value set successfully'})

@app.route('/get', methods=['GET'])
def get_value():
    key = request.args.get('key')
    value = get_token(key)
    return jsonify({'key': key, 'value': value})

@app.route("/seed", methods=['GET'])
def seed_users_data():
    permissions_file_path = os.path.join(os.path.dirname(__file__), 'permissions/data.json')

    if request.method == 'GET':
        Role.create_seed_data() 
        User.create_seed_data()
        Module.create_seed_data()
        Permission.create_seed_data(permissions_file_path)
        return jsonify({'message': 'Data seeded successfully'}), 200
    else: return 'Method is Not Allowed'

# Applications Routes
from .accounts import urls
from .roles import urls
from .modules import urls
from .permissions import urls
from .users import urls
from .rolePermissions import urls

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)