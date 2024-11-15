from flask import request, jsonify, g
from datetime import datetime, date, timedelta
from sqlalchemy.orm import joinedload, aliased
from sqlalchemy import func  # Import func from SQLAlchemy
import json
from .. import db
from ..util import custom_jwt_required
from ..poi.models import Poi
from ..organisation.models import Organisation
from ..brief.models import Brief


def get_percentage_difference(old_value, new_value):
    if old_value == 0:
        return 100.0 if new_value > 0 else 0.0
    return ((new_value - old_value) / old_value) * 100


# Get the current date and a day before
current_time = datetime.now()
yesterday = current_time - timedelta(days=1)

@custom_jwt_required
def get_data():
    try:
        # Get period and date range parameters from the request
        # period = request.args.get('period', 'daily')  # Default to 'daily'
        # start_date_str = request.args.get('start_date')
        # end_date_str = request.args.get('end_date')
        # now = datetime.utcnow()
        # poi_count = 0

        # # Initialize start_date and end_date to None
        # start_date = None
        # end_date = None

        # # If date range is provided, parse the start_date and end_date
        # if start_date_str and end_date_str:
        #     try:
        #         start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        #         end_date = datetime.strptime(end_date_str, '%Y-%m-%d') + timedelta(days=1)  # Include the entire end day
        #     except ValueError:
        #         return jsonify({'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400
        # else:
        #     # If no custom date range, calculate based on the period
        #     if period == 'daily':
        #         start_date = now - timedelta(days=1)
        #     elif period == 'weekly':
        #         start_date = now - timedelta(weeks=1)
        #     elif period == 'monthly':
        #         start_date = now - timedelta(days=30)

        #     end_date = now


        # # Query for POIs within the date range if start_date is set
        # if start_date and end_date:
        #     poi_count = Poi.query.filter(
        #         Poi.deleted_at.is_(None),
        #         Poi.created_at >= start_date,
        #         Poi.created_at < end_date
        #     ).count()
        # else:
        # Query totals up to a day before
        result = []
        
        poi_count = Poi.query.filter(Poi.deleted_at.is_(None)).count()
        org_count = Organisation.query.filter(Poi.deleted_at.is_(None)).count()
        brief_count = Brief.query.filter(Poi.deleted_at.is_(None)).count()
        
        poi_count_yesterday = Poi.query.filter(Poi.deleted_at.is_(None), Poi.created_at < yesterday).count()
        org_count_yesterday = Organisation.query.filter(Organisation.deleted_at.is_(None), Organisation.created_at < yesterday).count()
        brief_count_yesterday = Brief.query.filter(Brief.deleted_at.is_(None), Brief.created_at < yesterday).count()

        # Query totals up to today
        poi_count_today = Poi.query.filter(Poi.deleted_at.is_(None)).count()
        org_count_today = Organisation.query.filter(Organisation.deleted_at.is_(None)).count()
        brief_count_today = Brief.query.filter(Brief.deleted_at.is_(None)).count()

        # Calculate percentage differences
        poi_percentage_diff = get_percentage_difference(poi_count_yesterday, poi_count_today)
        org_percentage_diff = get_percentage_difference(org_count_yesterday, org_count_today)
        brief_percentage_diff = get_percentage_difference(brief_count_yesterday, brief_count_today)
        
        # calculate profile percentage difference
        profile_yesterday = poi_count_yesterday + org_count_yesterday
        profile_today = poi_count_today + org_count_today
        profile_percentage_diff = get_percentage_difference(profile_yesterday, profile_today)
        
        result.append({
            "poi": {
                "poi_count": poi_count,
                "poi_percentage_diff": poi_percentage_diff
            },
            "organisation": {
                "org_count": org_count,
                "org_percentage_diff": org_percentage_diff
            },
            "brief": {
                "brief_count": brief_count,
                "brief_percentage_diff": brief_percentage_diff
            },
            "profile": {
                "profile_count": poi_count + org_count,
                "brief_percentage_diff": profile_percentage_diff
            }
        })

        response = {
            'status': 'success',
            'data': result
        }
        return jsonify(response), 200

    except Exception as e:
        error_response = {
            'status': 'error',
            'message': str(e)
        }
        return jsonify(error_response), 500