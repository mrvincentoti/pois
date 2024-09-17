from flask import request
from ..app import app
from .controllers import (
    create_organisation, get_organisations, get_organisation, update_organisation, delete_organisation
)

# Create a new organisation
@app.route('/organisation', methods=['POST'])
def add_organisation():
    return create_organisation()

# Get all organisations
@app.route('/organisations', methods=['GET'])
def list_organisations():
    return get_organisations()

# Get a single organisation by ID
@app.route('/organisation/<int:id>', methods=['GET'])
def get_single_organisation(id):
    return get_organisation(id)

# Update an organisation by ID
@app.route('/organisation/<int:id>', methods=['PUT'])
def modify_organisation(id):
    return update_organisation(id)

# Delete an organisation by ID
@app.route('/organisation/<int:id>', methods=['DELETE'])
def remove_organisation(id):
    return delete_organisation(id)
