from flask import request, jsonify, json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import OrgActivity
from ..organisation.models import Organisation
from ..users.models import User
from ..util import custom_jwt_required, save_audit_data

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def get_activities():
    try:
        activities = OrgActivity.query.all()

        arm_list = []
        for activity in activities:
            arm_data = activity.to_dict()
            arm_list.append(arm_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'activities': arm_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def add_activity():
    data = request.get_json()

    org = Organisation.query.filter_by(id=data.get("org_id")).first()

    if not org:
        return jsonify({"message": "ORG not found"}), 201
            
    if request.method == "POST":
        data = request.get_json()
        org_id = data.get("org_id")
        comment = data.get("comment")
        activity_date = data.get("activity_date")
        created_by = g.user["id"]

        new_activity = OrgActivity(
            org_id=org_id,
            comment=comment,
            activity_date=activity_date,
            created_by=created_by
        )

        try:
            db.session.add(new_activity)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_activity",
                "auditable_id": new_activity.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "org_id":org_id,
                        "comment":comment,
                        "activity_date":activity_date,
                        "created_by":created_by
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "OrgActivity, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "OrgActivity added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding activity", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_activity(activity_id):
    activity = OrgActivity.query.filter_by(id=activity_id, deleted_at=None).first()
    activity = OrgActivity.query.filter_by(id=activity_id, deleted_at=None).first()
    
    if activity:
        # Fetch the associated ORG details
        org = Organisation.query.filter_by(id=activity.org_id).first()
        if org:
            org_name = org.org_name
        else:
            org_name = "Unknown ORG"

        # Fetch the name of the user who created the record
        created_by = User.query.filter_by(id=activity.created_by, deleted_at=None).first()
        created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"

        # Prepare the response data with the fetched names
        arm_data = {
            "id": activity.id,
            "org_id": org.id,
            "org_name": org_name,
            "comment": activity.comment,
            "activity_date": activity.activity_date,
            "created_by_id": activity.created_by,
            "created_by": created_by_name
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_activity",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "OrgActivity, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"activity": arm_data})
    else:
        return jsonify({"message": "OrgActivity not found"}), 404


@custom_jwt_required
def edit_activity(activity_id):
    if request.method == "PUT":
        data = request.get_json()
        org_id = data.get("org_id")
        comment = data.get("comment")
        activity_date = data.get("activity_date")
        updated_by = g.user["id"]

        # Find the activity entry by activity_id
        activity = OrgActivity.query.filter_by(id=activity_id, deleted_at=None).first()

        if not activity:
            return jsonify({"message": "OrgActivity not found"}), 404

        # Capture old values for auditing
        old_values = {
            "org_id": activity.org_id,
            "comment": activity.comment,
            "activity_date": activity.activity_date,
            "created_by": activity.created_by
        }

        # Update the activity fields with the new data
        activity.org_id = org_id
        activity.comment = comment
        activity.activity_date = activity_date

        try:
            db.session.commit()
            
            current_time = datetime.utcnow()
            # Capture new values for auditing
            new_values = {
                "org_id": org_id,
                "comment": comment,
                "activity_date": activity_date,
                "created_by": updated_by
            }

            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "update_activity",
                "auditable_id": activity.id,
                "old_values": json.dumps(old_values),
                "new_values": json.dumps(new_values),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "OrgActivity, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "OrgActivity updated successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error updating activity", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def delete_activity(activity_id):
    try:
        activity = OrgActivity.query.filter_by(id=activity_id, deleted_at=None).first()

        if not activity:
            return jsonify({"message": "OrgActivity not found"}), 404

        # Set the current timestamp to the deleted_at column for soft delete
        activity.soft_delete()

        # Optionally save the delete action in the audit log
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "soft_delete_activity",
            "auditable_id": activity.id,
            "old_values": json.dumps({"deleted_at": None}),
            "new_values": json.dumps({"deleted_at": activity.deleted_at}),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "OrgActivity, Delete",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        db.session.commit()
        return jsonify({"message": "OrgActivity deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting activity", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_activity(activity_id):
    try:
        activity = OrgActivity.query.filter(
            OrgActivity.id == activity_id,
            OrgActivity.deleted_at != None
        ).first()

        if not activity:
            return jsonify({"message": "Recovered activity not found or not deleted"}), 404

        # Restore the soft-deleted record by setting deleted_at to None
        activity.deleted_at = None

        # Optionally save the restore action in the audit log
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "restore_activity",
            "auditable_id": activity.id,
            "old_values": json.dumps({"deleted_at": activity.deleted_at}),
            "new_values": json.dumps({"deleted_at": None}),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "OrgActivity, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        db.session.commit()
        return jsonify({"message": "Recovered activity restored successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring recovered activity", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def get_activities_by_poi(org_id):
    try:
        # Get search parameters from request arguments
        search_term = request.args.get('q', '')

        # Query the OrgActivity table for the given org_id and filter by deleted_at
        query = OrgActivity.query.filter_by(org_id=org_id, deleted_at=None)

        # Apply search filters if a search term is provided
        if search_term:
            search_pattern = f"%{search_term}%"  # Search pattern for LIKE query
            query = query.filter(
                OrgActivity.comment.ilike(search_pattern)
            )

        # Order by activity_date in descending order (newest first)
        query = query.order_by(OrgActivity.activity_date.desc())

        # Execute the query and get the results
        activities = query.all()

        # Prepare the list of activities to return
        activity_list = []
        for activity in activities:
            # Fetch the name of the user who created the record
            created_by = User.query.filter_by(id=activity.created_by, deleted_at=None).first()
            created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"

            activity_data = {
                "org_id": activity.org_id,
                "comment": activity.comment,
                "activity_date": activity.activity_date.isoformat() if activity.activity_date else None,
                "created_by_id": activity.created_by,
                "created_by_name": created_by_name,
                "id":activity.id
            }
            activity_list.append(activity_data)

        # Return the list of activities with status success
        return jsonify({
            "status": "success",
            "status_code": 200,
            "activities": activity_list,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
