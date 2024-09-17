from flask import request


from ..app import app



@app.route("/deployments", methods=['GET', 'POST'])
def list_create_deployment():
   return 'Method is Not Allowed'

# @app.route("/directorates/<directorate_id>", methods=['GET', 'PUT', 'DELETE'])
# def retrieve_update_destroy_directorates(directorate_id):
#     if request.method == 'GET': return get_role(directorate_id)
#     if request.method == 'PUT': return edit_role(directorate_id)
#     if request.method == 'DELETE': return delete_role(directorate_id)
#     else: return 'Method is Not Allowed'


