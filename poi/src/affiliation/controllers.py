from flask import request, jsonify
from .models import Affiliation

def get_affiliations():
    try:
        affilitions = Affiliation.query.all()

        affilition_list = []
        for affilition in affilitions:
            affiliation_data = affilition.to_dict()
            affilition_list.append(affiliation_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'affiliations': affilition_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})
