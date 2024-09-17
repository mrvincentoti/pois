from flask import request, jsonify
from .models import Category

def get_categories():
    try:
        categories = Category.query.all()

        category_list = []
        for category in categories:
            category_data = category.to_dict()
            category_list.append(category_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'categories': category_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})
