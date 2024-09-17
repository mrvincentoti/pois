from flask import request
from ..app import app
from .controllers import add_cadre, list_cadres, update_cadre, delete_cadre, restore_cadre, get_cadre

@app.route("/cadres", methods=["POST", "GET"])
def create_list_cadres():
    if request.method == "POST":
        return add_cadre()
    elif request.method == "GET":
        return list_cadres()
    else:
        return "Method is Not Allowed"

@app.route("/cadre/<cadre_id>", methods=["PUT", "DELETE", "GET"])
def update_delete_get_cadre(cadre_id):
    if request.method == "PUT":
        return update_cadre(cadre_id)
    elif request.method == "DELETE":
        return delete_cadre(cadre_id)
    elif request.method == "GET":
        return get_cadre(cadre_id)
    else:
        return "Method is Not Allowed"
    
@app.route("/cadre/restore/<cadre_id>", methods=['GET'])
def restore_cadre_(cadre_id):
    if request.method == 'GET': return restore_cadre(cadre_id)
    else: return 'Method is Not Allowed'
