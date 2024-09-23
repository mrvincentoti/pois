from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import CrimeCommitted
from ..users.models import User
from ..util import custom_jwt_required, save_audit_data

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def get_crimes_committed():
    try:
        crimes_committed = CrimeCommitted.query.all()

        crime_committed_list = []
        for crime_committed in crimes_committed:
            crime_committed_data = crime_committed.to_dict()
            crime_committed_list.append(crime_committed_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'crimes_committed': crime_committed_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def add_crime_committed():
    if request.method == "POST":
        data = request.get_json()

        # Get the input fields from the request
        poi_id = data.get("poi_id")
        crime_id = data.get("crime_id")
        crime_date = data.get("crime_date")
        casualties_recorded = data.get("casualties_recorded")
        place_of_detention = data.get("place_of_detention")
        arresting_body_id = data.get("arresting_body_id")
        action_taken = data.get("action_taken")
        comments = data.get("comments")
        created_by = g.user["id"] if hasattr(g, "user") else None

        # Check if any required fields are missing
        if not crime_id or not poi_id or not created_by:
            return jsonify({"message": "Crime ID, POI ID and Created By are required"}), 400

        # Create a new instance of CrimeCommitted
        new_crime_committed = CrimeCommitted(
            poi_id=poi_id,
            crime_id=crime_id,
            crime_date=crime_date,
            casualties_recorded=casualties_recorded,
            place_of_detention=place_of_detention,
            arresting_body_id=arresting_body_id,
            action_taken=action_taken,
            comments=comments,
            created_by=created_by,
            created_at=datetime.utcnow()
        )

        try:
            # Add the new record to the session and commit
            db.session.add(new_crime_committed)
            db.session.commit()

            # Prepare audit data
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": created_by,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "add_crime_committed",
                "auditable_id": new_crime_committed.id,
                "old_values": None,
                "new_values": json.dumps(
                    {   
                        "poi_id": poi_id,
                        "crime_id": crime_id,
                        "crime_date": crime_date,
                        "casualties_recorded": casualties_recorded,
                        "place_of_detention": place_of_detention,
                        "arresting_body_id": arresting_body_id,
                        "action_taken": action_taken,
                        "comments": comments,
                        "created_by": created_by
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "CrimeCommitted, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            # Save audit data
            save_audit_data(audit_data)

            # Return success response
            return jsonify({"message": "Crime committed added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding crime committed", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_crime_committed(crime_committed_id):
    # Fetch the crime committed, ensuring it's not soft deleted (deleted_at is None)
    crime_committed = CrimeCommitted.query.filter_by(id=crime_committed_id, deleted_at=None).first()
    
    if crime_committed:
        crime_committed_data = {
            "id": crime_committed.id,
            "poi_id": crime_committed.poi_id,
            "crime_id": crime_committed.crime_id,
            "crime_date": crime_committed.crime_date,
            "casualties_recorded": crime_committed.casualties_recorded,
            "place_of_detention": crime_committed.place_of_detention,
            "arresting_body_id": crime_committed.arresting_body_id,
            "action_taken": crime_committed.action_taken,
            "comments": crime_committed.comments,
            "created_by": crime_committed.created_by,
            "created_at": crime_committed.created_at,
            "deleted_at": crime_committed.deleted_at
        }

        # Record audit event
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_crime_committed",
            "auditable_id": crime_committed.id,
            "old_values": None,
            "new_values": json.dumps(crime_committed_data),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "CrimeCommitted, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"crime_committed": crime_committed_data}), 200
    else:
        return jsonify({"message": "Crime committed not found"}), 404


@custom_jwt_required
def edit_crime_committed(crime_committed_id):
    # Fetch the crime committed, ensuring it's not soft deleted
    crime_committed = CrimeCommitted.query.filter_by(id=crime_committed_id, deleted_at=None).first()

    if crime_committed is None:
        return jsonify({"message": "Crime committed not found"}), 404

    data = request.get_json()

    # Extract new data for the columns
    poi_id = data.get("poi_id")
    crime_id = data.get("crime_id")
    crime_date = data.get("crime_date")
    casualties_recorded = data.get("casualties_recorded")
    place_of_detention = data.get("place_of_detention")
    arresting_body_id = data.get("arresting_body_id")
    action_taken = data.get("action_taken")
    comments = data.get("comments")

    # Update fields if provided
    crime_committed.update(
        poi_id=poi_id,
        crime_id=crime_id,
        crime_date=crime_date,
        casualties_recorded=casualties_recorded,
        place_of_detention=place_of_detention,
        arresting_body_id=arresting_body_id,
        action_taken=action_taken,
        comments=comments
    )

    try:
        db.session.commit()

        # Prepare audit data
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "edit_crime_committed",
            "auditable_id": crime_committed.id,
            "old_values": None,
            "new_values": json.dumps({
                "poi_id": poi_id,
                "crime_id": crime_id,
                "crime_date": crime_date,
                "casualties_recorded": casualties_recorded,
                "place_of_detention": place_of_detention,
                "arresting_body_id": arresting_body_id,
                "action_taken": action_taken,
                "comments": comments
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "CrimeCommitted, Update",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"message": "Crime committed updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating crime committed", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_crime_committed(crime_committed_id):
    crime_committed = CrimeCommitted.query.filter_by(id=crime_committed_id, deleted_at=None).first()

    if crime_committed is None:
        return jsonify({"message": "Crime committed not found"}), 404

    try:
        crime_committed.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "delete_crime_committed",
            "auditable_id": crime_committed.id,
            "old_values": None,
            "new_values": json.dumps({
                "poi_id": crime_committed.poi_id,
                "crime_id": crime_committed.crime_id,
                "crime_date": crime_committed.crime_date,
                "casualties_recorded": crime_committed.casualties_recorded,
                "place_of_detention": crime_committed.place_of_detention,
                "arresting_body_id": crime_committed.arresting_body_id,
                "action_taken": crime_committed.action_taken,
                "comments": crime_committed.comments
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "CrimeCommitted, Delete",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Crime committed deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting crime committed", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_crime_committed(crime_committed_id):
    crime_committed = CrimeCommitted.query.filter_by(id=crime_committed_id).first()

    if crime_committed is None:
        return jsonify({"message": "Crime committed not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_crime_committed",
            "auditable_id": crime_committed.id,
            "old_values": None,
            "new_values": json.dumps({
                "poi_id": crime_committed.poi_id,
                "crime_id": crime_committed.crime_id,
                "crime_date": crime_committed.crime_date,
                "casualties_recorded": crime_committed.casualties_recorded,
                "place_of_detention": crime_committed.place_of_detention,
                "arresting_body_id": crime_committed.arresting_body_id,
                "action_taken": crime_committed.action_taken,
                "comments": crime_committed.comments
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "CrimeCommitted, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        crime_committed.restore()
        db.session.commit()
        return jsonify({"message": "Crime committed restored successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring crime committed", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def get_crimes_committed_by_poi(poi_id):
    try:
        # Get search parameters from request arguments
        search_term = request.args.get('q', '')

        # Query crimes committed by the given poi_id and that have not been soft deleted
        query = CrimeCommitted.query.filter_by(poi_id=poi_id, deleted_at=None)

        # Apply search filters if a search term is provided
        if search_term:
            search_pattern = f"%{search_term}%"  # Search pattern for LIKE query
            query = query.filter(
                (CrimeCommitted.action_taken.ilike(search_pattern)) |
                (CrimeCommitted.comments.ilike(search_pattern)) |
                (CrimeCommitted.place_of_detention.ilike(search_pattern)) |
                (CrimeCommitted.crime_date.ilike(search_pattern))
            )

        # Execute the query and get the results
        crimes_committed = query.all()

        # Check if any crimes were found for the given POI
        if not crimes_committed:
            return jsonify({"message": "No crimes found for the given POI"}), 404

        # Prepare the list of crimes committed to return
        crime_list = []
        for crime in crimes_committed:
            # Fetch the name of the user who created the crime record
            created_by = User.query.filter_by(id=crime.created_by, deleted_at=None).first()
            created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"

            # Prepare data for each crime committed
            crime_data = {
                "crime_id": crime.crime_id,
                "poi_id": crime.poi_id,
                "crime_date": crime.crime_date.isoformat() if crime.crime_date else None,
                "action_taken": crime.action_taken,
                "casualties_recorded": crime.casualties_recorded,
                "place_of_detention": crime.place_of_detention,
                "arresting_body_id": crime.arresting_body_id,
                "comments": crime.comments,
                "created_by_id": crime.created_by,
                "created_by_name": created_by_name
            }
            crime_list.append(crime_data)

        # Return the list of crimes committed with a success status
        return jsonify({
            "status": "success",
            "status_code": 200,
            "crimes_committed": crime_list,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

