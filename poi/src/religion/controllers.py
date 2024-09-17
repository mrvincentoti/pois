from flask import request, jsonify

from .models import Religion
from ..redis_manager import custom_jwt_required

def get_religions():
    try:
        religions = Religion.query.all()

        religions_list = []
        for religion in religions:
            religion_data = religion.to_dict()
            religions_list.append(religion_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'religions': religions_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})
