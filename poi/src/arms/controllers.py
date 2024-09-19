from flask import request, jsonify
from .models import Arms

def get_arms():
    try:
        arms = Arms.query.all()

        arm_list = []
        for arm in arms:
            arm_data = arm.to_dict()
            arm_list.append(arm_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'categories': arm_list
        })
    except Exception as e:
        return jsonify({'error': str(e)})
