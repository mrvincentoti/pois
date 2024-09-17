from flask import request, jsonify

from .models import Gender
from ..redis_manager import custom_jwt_required

def get_genders():
    try:
        genders = Gender.query.all()

        genders_list = []
        for gender in genders:
            gender_data = gender.to_dict()
            genders_list.append(gender_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'genders': genders_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})
