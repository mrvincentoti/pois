from flask import request, jsonify, g
from datetime import datetime, date, timedelta
from sqlalchemy.orm import joinedload, aliased
from sqlalchemy import func  # Import func from SQLAlchemy
import json
from .. import db
from ..util import custom_jwt_required
from ..poi.models import Poi


@custom_jwt_required
def get_data():
    try:
        # Get period and date range parameters from the request
        period = request.args.get('period', 'daily')  # Default to 'daily'
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        now = datetime.utcnow()

        # Initialize start_date and end_date to None
        start_date = None
        end_date = None

        # If date range is provided, parse the start_date and end_date
        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d') + timedelta(days=1)  # Include the entire end day
            except ValueError:
                return jsonify({'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400
        else:
            # If no custom date range, calculate based on the period
            if period == 'daily':
                start_date = now - timedelta(days=1)
            elif period == 'weekly':
                start_date = now - timedelta(weeks=1)
            elif period == 'monthly':
                start_date = now - timedelta(days=30)

            end_date = now

        # Query for POIs within the date range if start_date is set
        if start_date and end_date:
            poi_count = Poi.query.filter(
                Poi.deleted_at.is_(None),
                Poi.created_at >= start_date,
                Poi.created_at < end_date
            ).count()
        else:
            poi_count = Poi.query.filter(Poi.deleted_at.is_(None)).count()

        response = {
            'status': 'success',
            'total_poi': poi_count
        }
        return jsonify(response), 200

    except Exception as e:
        error_response = {
            'status': 'error',
            'message': str(e)
        }
        return jsonify(error_response), 500