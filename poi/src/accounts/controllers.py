from flask import request, jsonify
import uuid

from .. import db
from .models import Account


def list_all_accounts_controller():
    accounts = Account.query.all()
    response = []
    for account in accounts: response.append(account.toDict())
    return jsonify(response)


def create_account_controller():
    request_data = request.form.to_dict()

    # Extract the password from the request data
    password = request_data.get('password')

    if not password:
        return jsonify({'message': 'Password is required'}), 400

    id = str(uuid.uuid4())

    # Create a new Account instance and set the hashed password
    new_account = Account(
        id=id,
        email=request_data['email'],
        username=request_data['username'],
        password=password,  # Set the hashed password
    )

    # Add the new account to the database
    db.session.add(new_account)
    db.session.commit()

    response = Account.query.get(id).toDict()
    return jsonify(response)


def retrieve_account_controller(account_id):
    response = Account.query.get(account_id).toDict()
    return jsonify(response)

def update_account_controller(account_id):
    request_data = request.get_json()
    account = Account.query.get(account_id)

    if not account:
        return jsonify({'message': 'Account not found'}), 404

    # Check if a new password is provided in the JSON data
    new_password = request_data.get('password')

    if new_password:
        # Set the new hashed password if a new password is provided
        account.set_password(new_password)

    # Update the account's fields
    account.email = request_data.get('email', account.email)
    account.username = request_data.get('username', account.username)

    # Update the is_active field if provided
    is_active = request_data.get('is_active')
    if is_active is not None:
        account.is_active = is_active

    db.session.commit()

    response = account.toDict()
    return jsonify(response)

def delete_account_controller(account_id):
    Account.query.filter_by(id=account_id).delete()
    db.session.commit()

    return ('Account with Id "{}" deleted successfully!').format(account_id)