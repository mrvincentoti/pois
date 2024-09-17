from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

from .. import db
from .models import Station
from ..redis_manager import custom_jwt_required

def get_stations_by_region():
    try:
        page = int(request.args.get('page', 1))
        per_page = request.args.get('per_page', default=10, type=int)
        region_id = request.args.get('region_id')

        station_query = Station.query.filter_by(region_id=region_id) if region_id else Station.query
        stations = station_query.options(joinedload(Station.region)).paginate(page=page, per_page=per_page, error_out=False)

        stations_list = []
        for station in stations.items:
            station_data = station.to_dict()
            stations_list.append(station_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'stations': stations_list,
            'total_results': stations.total,
            'total_pages': stations.pages,
            'current_page': stations.page,
            'per_page': per_page
        })
    except Exception as e:
        return jsonify({'error': str(e)})