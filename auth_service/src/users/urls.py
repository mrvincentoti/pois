from flask import request

from ..app import app
from .controllers import list_users, create_user, get_user, update_user, soft_delete_user, restore_user, login_user, logout_user, search_users, set_user_password_impl, seed_data

@app.route("/users", methods=['GET', 'POST'])
def list_create_users():
    if request.method == 'GET': return list_users()
    if request.method == 'POST': return create_user()
    else: return 'Method is Not Allowed'

@app.route("/users/<user_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_delete_users(user_id):
    if request.method == 'GET': return get_user(user_id)
    if request.method == 'PUT': return update_user(user_id)
    if request.method == 'DELETE': return soft_delete_user(user_id)
    else: return 'Method is Not Allowed'
    
@app.route("/user/restore/<user_id>", methods=['GET'])
def restore_single_user(user_id):
    if request.method == 'GET': return restore_user(user_id)
    else: return 'Method is Not Allowed'
    
@app.route("/user/login", methods=['POST'])
def log_user_in():
    if request.method == 'POST': return login_user()
    else: return 'Method is Not Allowed'
    
@app.route("/user/logout", methods=['POST'])
def log_user_out():
    if request.method == 'POST': return logout_user()
    else: return 'Method is Not Allowed'
    
@app.route("/search_users", methods=['GET'])
def search_users_route():
    return search_users()

@app.route("/user/set_password/<int:user_id>", methods=['POST'])
def set_user_password(user_id):
    if request.method == 'POST':
        return set_user_password_impl(user_id)
    else:
        return 'Method is Not Allowed'
    