from flask import request, jsonify
from .models import Source

def get_sources():
    try:
        sources = Source.query.all()

        source_list = []
        for source in sources:
            source_data = source.to_dict()
            source_list.append(source_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'sources': source_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})
