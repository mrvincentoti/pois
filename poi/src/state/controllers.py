from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_

from .. import db
from .models import State
from ..redis_manager import custom_jwt_required

def get_states():
    try:
        states = State.query.all()

        states_list = []
        for state in states:
            state_data = state.to_dict()
            states_list.append(state_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'states': states_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})
    
    
def publish_to_alpha():
    try:
        data = request.json
        # Assuming the received data matches the structure provided
        # Publish the data to the 'alpha' Redis channel
        redis_client.publish('alpha', str(data))
        return jsonify({"message": "Data published to Redis channel 'alpha'"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500