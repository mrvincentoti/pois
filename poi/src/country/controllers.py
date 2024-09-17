from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError

from .. import db
from .models import Country

def get_countries():
    try:
        page = int(request.args.get('page', 1))
        per_page = request.args.get('per_page', default=10, type=int)

        countries = Country.query.paginate(page=page, per_page=per_page, error_out=False)

        countries_list = []
        for country in countries.items:
            country_data = country.to_dict()
            countries_list.append(country_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'countries': countries_list,
            'total_results': countries.total,
            'total_pages': countries.pages,
            'current_page': countries.page,
            'per_page': per_page
        })
    except Exception as e:
        return jsonify({'error': str(e)})