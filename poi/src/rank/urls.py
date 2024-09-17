from flask import request

from ..app import app
from .controllers import add_rank, import_ranks, list_ranks, list_all_ranks, get_rank, edit_rank, delete_rank, restore_rank, \
    get_rank_by_cadre, post_message, get_message


@app.route("/ranks", methods=['GET', 'POST'])
def list_create_ranks():
    if request.method == 'GET': return list_ranks()
    if request.method == 'POST':
        return add_rank()
    else:
        return 'Method is Not Allowed'


@app.route("/all-ranks", methods=['GET'])
def get_all_ranks():
    if request.method == 'GET':
        return list_all_ranks()
    else:
        return 'Method is Not Allowed'


@app.route("/rank/<rank_id>", methods=['GET', 'PUT', 'DELETE'])
def retrieve_update_destroy_ranks(rank_id):
    if request.method == 'GET': return get_rank(rank_id)
    if request.method == 'PUT': return edit_rank(rank_id)
    if request.method == 'DELETE':
        return delete_rank(rank_id)
    else:
        return 'Method is Not Allowed'


@app.route("/ranks/cadre/<cadre_id>", methods=['GET'])
def retrieve_ranks_by_cadre_id(cadre_id):
    if request.method == 'GET':
        return get_rank_by_cadre(cadre_id)
    else:
        return 'Method is Not Allowed'


@app.route("/rank/restore/<rank_id>", methods=['GET'])
def restore_rank_(rank_id):
    if request.method == 'GET':
        return restore_rank(rank_id)
    else:
        return 'Method is Not Allowed'


@app.route("/rank/rabbitmq", methods=['GET', 'POST'])
def get_create_queue():
    if request.method == 'POST':
        return post_message()
    else: return get_message()


@app.route("/import-ranks", methods=['POST'])
def do_import_ranks():
    if request.method == 'POST':
        return import_ranks()
    else:
        return 'Method is Not Allowed'