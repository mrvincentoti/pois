from flask import request, jsonify, json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import ActivityItem
from ..arms.models import Arm
from ..poi.models import Poi
from ..users.models import User
from ..util import custom_jwt_required, save_audit_data
from ..crimesCommitted.models import CrimeCommitted
from ..crimes.models import Crime

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def delete_item(item_id):
    try:
        # Query for the arm to be soft-deleted, ensuring it's not already deleted
        arm = ArmsRecovered.query.filter_by(id=recovery_id, deleted_at=None).first()

        if not arm:
            return jsonify({"message": "Recovered arm not found"}), 404

        # Set the current timestamp to the deleted_at column for soft delete
        arm.soft_delete()

        # Commit the soft delete change
        db.session.commit()

        # Optionally save the delete action in the audit log
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "soft_delete_recovered_arm",
            "auditable_id": arm.id,
            "old_values": json.dumps({"deleted_at": None}),
            "new_values": json.dumps({"deleted_at": arm.deleted_at.isoformat()}),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "ArmsRecovered, Delete",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        return jsonify({"message": "Recovered arm deleted successfully"}), 200
    except Exception as e:
        # Roll back in case of an error
        db.session.rollback()
        return jsonify({"message": "Error deleting recovered arm", "error": str(e)}), 500
    finally:
        # Close the session after the request
        db.session.close()


@custom_jwt_required
def get_items_by_poi(poi_id):
    try:
        # Get pagination and search parameters from request arguments
        search_term = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        query = ActivityItem.query.filter_by(poi_id=poi_id)

        # Apply search filters if a search term is provided
        if search_term:
            search_pattern = f"%{search_term}%"  # Search pattern for LIKE query
            query = query.filter(
                (ActivityItem.item.ilike(search_pattern))
            )

        # Paginate the query result
        items_paginated = query.order_by(ActivityItem.created_at.desc())\
                            .paginate(page=page, per_page=per_page, error_out=False)

        # Prepare the list of recovered arms to return
        item_list = []
        for item in items_paginated.items:
            # Fetch the associated POI details
            poi = Poi.query.filter_by(id=item.poi_id).first()
            poi_name = f"{poi.first_name or ''} {poi.middle_name or ''} {poi.last_name or ''} ({poi.ref_numb or ''})".strip() if poi else "Unknown POI"

            # Fetch the name of the user who created the record
            created_by = User.query.filter_by(id=arm.created_by, deleted_at=None).first()
            created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"
            
            # Fetch the Activity record
            acitvity_committed = Activity.query.filter_by(id=item.activity_id).first()

            # Initialize activity_name as None
            activity_name = None

            # Proceed only if activity_committed is found
            if activity_committed:
                activity = Activity.query.filter_by(id=activity_committed.activity_id).first()
                activity_name = f"{crime.name or ''}".strip() if crime else None
                
            item_data = {
                "item": {
                    "id": arm.arm.id,
                    "name": arm.arm.name,
                } if arm.arm else None,
                "poi_id": arm.poi_id,
                "poi_name": poi_name,
                "qty": item.qty,
            }
            item_list.append(item_data)

        # Prepare the paginated response
        response = {
            'total': arms_paginated.total,
            'pages': arms_paginated.pages,
            'current_page': arms_paginated.page,
            'per_page': arms_paginated.per_page,
            'items': item_list,
            'status': 'success',
            'status_code': 200
        }

        # Return the response with recovered arms data
        return jsonify(response), 200
    except Exception as e:
        # Catch any errors and return a server error response
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
