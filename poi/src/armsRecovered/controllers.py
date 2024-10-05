from flask import request, jsonify, json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import ArmsRecovered
from ..arms.models import Arm
from ..poi.models import Poi
from ..users.models import User
from ..util import custom_jwt_required, save_audit_data
from ..crimesCommitted.models import CrimeCommitted
from ..crimes.models import Crime

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def get_arms_recovered():
    try:
        arms = ArmsRecovered.query.all()

        arm_list = []
        for arm in arms:
            arm_data = arm.to_dict()
            arm_list.append(arm_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'arms': arm_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def add_arm_recovered():
    if request.method == "POST":
        data = request.get_json()
        arm_id = data.get("arm_id")
        poi_id = data.get("poi_id")
        crime_id = data.get('crime_id')
        location = data.get("location")
        comments = data.get("comments")
        recovery_date = data.get("recovery_date")
        number_recovered = data.get("number_recovered")
        created_by = g.user["id"]

        new_recovered_arm = ArmsRecovered(
            arm_id=arm_id,
            poi_id=poi_id,
            crime_id=crime_id,
            location=location,
            comments=comments,
            recovery_date=recovery_date,
            created_by=created_by,
            number_recovered=number_recovered
        )

        try:
            db.session.add(new_recovered_arm)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_recovered_arm",
                "auditable_id": new_recovered_arm.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "arm_id": arm_id,
                        "poi_id":poi_id,
                        "crime_id":crime_id,
                        "location":location,
                        "comments":comments,
                        "recovery_date":recovery_date,
                        "created_by":created_by,
                        "number_recovered":number_recovered
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "ArmsRecovered, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Recovered arm added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding arm recovered", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_arm_recovered(recovery_id):
    arm = ArmsRecovered.query.filter_by(id=recovery_id, deleted_at=None).first()
    arm_recovery = ArmsRecovered.query.filter_by(id=recovery_id, deleted_at=None).first()
    
    if arm_recovery:
        # Fetch the associated arm name
        arm = Arm.query.filter_by(id=arm_recovery.arm_id).first()
        arm_name = arm.name if arm else "Unknown Arm"

        # Fetch the associated POI details
        poi = Poi.query.filter_by(id=arm_recovery.poi_id).first()
        if poi:
            poi_name = f"{poi.first_name or ''} {poi.middle_name or ''} {poi.last_name or ''} ({poi.ref_numb or ''})".strip()
        else:
            poi_name = "Unknown POI"

        # Fetch the name of the user who created the record
        created_by = User.query.filter_by(id=arm_recovery.created_by, deleted_at=None).first()
        created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"

        # Prepare the response data with the fetched names
        arm_data = {
            "arm_id": arm_recovery.id,
            "arm_name": arm_name,
            "poi_id": poi.id,
            "poi_name": poi_name,
            "crime_id": arm_recovery.crime_id,
            "location": arm_recovery.location,
            "comments": arm_recovery.comments,
            "recovery_date": arm_recovery.recovery_date,
            "created_by_id": arm_recovery.created_by,
            "created_by": created_by_name,
            "number_recovered": number_recovered
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_recovered_arm",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "ArmsRecovered, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"recovered_arm": arm_data})
    else:
        return jsonify({"message": "Arm Recovered not found"}), 404


@custom_jwt_required
def edit_arm_recovered(recovery_id):
    if request.method == "PUT":
        data = request.get_json()
        arm_id = data.get("arm_id")
        poi_id = data.get("poi_id")
        crime_id = data.get("crime_id")
        location = data.get("location")
        comments = data.get("comments")
        recovery_date = data.get("recovery_date")
        updated_by = g.user["id"]
        number_recovered = data.get("number_recovered")

        # Find the recovered arm entry by recovery_id
        arm_recovered = ArmsRecovered.query.filter_by(id=recovery_id, deleted_at=None).first()

        if not arm_recovered:
            return jsonify({"message": "Recovered arm not found"}), 404

        # Capture old values for auditing
        old_values = {
            "arm_id": arm_recovered.arm_id,
            "poi_id": arm_recovered.poi_id,
            "crime_id": arm_recovered.crime_id,
            "location": arm_recovered.location,
            "comments": arm_recovered.comments,
            "recovery_date": arm_recovered.recovery_date,
            "created_by": arm_recovered.created_by,
            "number_recovered": number_recovered
        }

        # Update the recovered arm fields with the new data
        arm_recovered.arm_id = arm_id
        arm_recovered.poi_id = poi_id
        arm_recovered.crime_id = crime_id
        arm_recovered.location = location
        arm_recovered.comments = comments
        arm_recovered.recovery_date = recovery_date
        arm_recovered.number_recovered = number_recovered

        try:
            db.session.commit()
            
            current_time = datetime.utcnow()
            # Capture new values for auditing
            new_values = {
                "arm_id": arm_id,
                "poi_id": poi_id,
                "crime_id": crime_id,
                "location": location,
                "comments": comments,
                "recovery_date": recovery_date,
                "created_by": updated_by,
                "number_recovered": number_recovered
            }

            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "update_recovered_arm",
                "auditable_id": arm_recovered.id,
                "old_values": json.dumps(old_values),
                "new_values": json.dumps(new_values),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "ArmsRecovered, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Recovered arm updated successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error updating arm recovered", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def delete_arm_recovered(recovery_id):
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
def restore_arm_recovered(recovery_id):
    try:
        arm = ArmsRecovered.query.filter(
            ArmsRecovered.id == recovery_id,
            ArmsRecovered.deleted_at != None
        ).first()

        if not arm:
            return jsonify({"message": "Recovered arm not found or not deleted"}), 404

        # Restore the soft-deleted record by setting deleted_at to None
        arm.deleted_at = None

        # Optionally save the restore action in the audit log
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "restore_recovered_arm",
            "auditable_id": arm.id,
            "old_values": json.dumps({"deleted_at": arm.deleted_at}),
            "new_values": json.dumps({"deleted_at": None}),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "ArmsRecovered, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        db.session.commit()
        return jsonify({"message": "Recovered arm restored successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring recovered arm", "error": str(e)}), 500
    finally:
        db.session.close()
        

@custom_jwt_required
def get_arms_recovered_by_poi(poi_id):
    try:
        # Get pagination and search parameters from request arguments
        search_term = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        query = ArmsRecovered.query.filter_by(poi_id=poi_id, deleted_at=None)

        # Apply search filters if a search term is provided
        if search_term:
            search_pattern = f"%{search_term}%"  # Search pattern for LIKE query
            query = query.filter(
                (ArmsRecovered.location.ilike(search_pattern)) |
                (ArmsRecovered.comments.ilike(search_pattern))
            )

        # Paginate the query result
        arms_paginated = query.order_by(ArmsRecovered.recovery_date.desc())\
                            .paginate(page=page, per_page=per_page, error_out=False)

        # Prepare the list of recovered arms to return
        arm_list = []
        for arm in arms_paginated.items:
            # Fetch the associated POI details
            poi = Poi.query.filter_by(id=arm.poi_id).first()
            poi_name = f"{poi.first_name or ''} {poi.middle_name or ''} {poi.last_name or ''} ({poi.ref_numb or ''})".strip() if poi else "Unknown POI"

            # Fetch the name of the user who created the record
            created_by = User.query.filter_by(id=arm.created_by, deleted_at=None).first()
            created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"
            
            # Fetch the CrimeCommitted record
            crime_committed = CrimeCommitted.query.filter_by(id=arm.crime_id).first()

            # Initialize crime_name as None
            crime_name = None

            # Proceed only if crime_committed is found
            if crime_committed:
                crime = Crime.query.filter_by(id=crime_committed.crime_id).first()
                crime_name = f"{crime.name or ''}".strip() if crime else None
                
            arm_data = {
                "id": arm.id,
                "arm_id": arm.arm_id,
                "arm": {
                    "id": arm.arm.id,
                    "name": arm.arm.name,
                } if arm.arm else None,
                "poi_id": arm.poi_id,
                "poi_name": poi_name,
                "crime_id": arm.crime_id,
                "crime_committed": crime_name,
                "location": arm.location,
                "comments": arm.comments,
                "recovery_date": arm.recovery_date.isoformat() if arm.recovery_date else None,
                "created_by_id": arm.created_by,
                "created_by_name": created_by_name,
                "number_recovered": arm.number_recovered
            }
            arm_list.append(arm_data)

        # Prepare the paginated response
        response = {
            'total': arms_paginated.total,
            'pages': arms_paginated.pages,
            'current_page': arms_paginated.page,
            'per_page': arms_paginated.per_page,
            'recovered_arms': arm_list,
            'status': 'success',
            'status_code': 200
        }

        # Return the response with recovered arms data
        return jsonify(response), 200

    except Exception as e:
        # Catch any errors and return a server error response
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
