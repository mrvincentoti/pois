from flask import request, jsonify
from .models import ArmsRecovered

def get_arms_recovered():
    try:
        recoveries = ArmsRecovered.query.all()

        recovery_list = []
        for recovery in recoveries:
            recovery_data = recovery.to_dict()
            recovery_list.append(recovery_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'arms_recovered': recovery_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})
