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
from ..category.models import Category
from ..activities.models import Activity

def get_percentage_difference(old_value, new_value):
    if old_value == 0:
        return 100.0 if new_value > 0 else 0.0
    return ((new_value - old_value) / old_value) * 100


def fetch_poi_data_by_category():
    # Query to get category names and their corresponding counts
    category_counts = db.session.query(
        Category.name,
        func.count(Poi.id)
    ).join(Poi, Category.id == Poi.category_id).group_by(Category.name).all()

    # Convert the result to separate lists for names and counts
    category_names = [result[0] for result in category_counts]
    category_counts_list = [result[1] for result in category_counts]

    return category_names, category_counts_list


def get_activity_counts_by_type():
    type_id_names = {
        1: "Attack",
        2: "Procurement",
        3: "Items Carted Away",
        4: "Press Release",
        5: "Others"
    }
    
    activity_counts = db.session.query(
        Activity.type_id,
        func.count(Activity.id)
    ).filter(Activity.deleted_at.is_(None)).group_by(Activity.type_id).all()

    type_names = [type_id_names.get(result[0], "Unknown") for result in activity_counts]
    counts = [result[1] for result in activity_counts]

    return type_names, counts


def fetch_org_data_by_category():
    # Query to get category names and their corresponding counts for Organisation
    organisation_counts = db.session.query(
        Category.name,
        func.count(Organisation.id)
    ).join(Organisation, Category.id == Organisation.category_id).group_by(Category.name).all()

    # Convert the result to separate lists for names and counts
    organisation_names = [result[0] for result in organisation_counts]
    organisation_counts_list = [result[1] for result in organisation_counts]

    return organisation_names, organisation_counts_list

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
        
        categories, category_counts_list = fetch_poi_data_by_category()
        organisation_names, organisation_counts_list = fetch_org_data_by_category()
        type_names, type_counts_list = get_activity_counts_by_type()
        
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
            },
            "poi_category_statistics": {
                "categories": categories,
                "series": category_counts_list
            },
            "org_category_statistics": {
                "categories": organisation_names,
                "series": organisation_counts_list
            },
            "poi_activities_by_type": {
                "categories": type_names,
                "series": type_counts_list
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