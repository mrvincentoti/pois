from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_

from .. import db
from .models import Region
from ..redis_manager import custom_jwt_required

def get_regions():
    try:
        page = int(request.args.get('page', 1))
        per_page = request.args.get('per_page', default=10, type=int)

        regions = Region.query.paginate(page=page, per_page=per_page, error_out=False)

        regions_list = []
        for region in regions.items:
            region_data = region.to_dict()
            regions_list.append(region_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'regions': regions_list,
            'total_results': regions.total,
            'total_pages': regions.pages,
            'current_page': regions.page,
            'per_page': per_page
        })
    except Exception as e:
        return jsonify({'error': str(e)})
