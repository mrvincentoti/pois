from flask import request, jsonify, json, g
from datetime import datetime
from .. import db
import os
import uuid
from urllib.parse import urljoin
from .models import OrgActivity
from ..activityItem.models import ActivityItem
from ..organisation.models import Organisation
from ..orgMedia.models import OrgMedia
from ..poi.models import Poi
from ..activities.models import Activity
from ..poiMedia.models import PoiMedia
from ..users.models import User
from dotenv import load_dotenv
from ..util import custom_jwt_required, save_audit_data, upload_file_to_minio, get_media_type_from_extension, permission_required, allowed_file

load_dotenv()

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
@permission_required
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
@permission_required
def add_activity():
    if request.method == "POST":
        try:
            # Collect form data
            form_data = {
                "type_id": request.form.get("type_id"),
                "org_id": request.form.get("org_id"),
                "title": request.form.get("title"),
                "crime_id": request.form.get("crime_id"),
                "casualties_recorded": request.form.get("casualties_recorded"),
                "nature_of_attack": request.form.get("nature_of_attack"),
                "location": request.form.get("location"),
                "action_taken": request.form.get("action_taken"),
                "location_from": request.form.get("location_from"),
                "location_to": request.form.get("location_to"),
                "facilitator": request.form.get("facilitator"),
                "comment": request.form.get("comment"),
                "activity_date": request.form.get("activity_date"),
                "created_by": g.user["id"],
            }

            # Retrieve multiple items and quantities
            items = request.form.getlist("items[]")
            qtys = request.form.getlist("qtys[]")

            # Check if there are any items first
            if items:
                # Validate that items and quantities match in length
                if not qtys or len(items) != len(qtys):
                    return jsonify({"message": "Items or quantities missing or mismatched"}), 400
                # Ensure all qtys are valid numbers
                try:
                    qtys = [int(qty) for qty in qtys] 
                except ValueError:
                    return jsonify({"message": "Quantities must be valid numbers"}), 400

            # Prepare item-qty pairs as a list of dictionaries
            item_qty_pairs = [{"item": items[i], "qty": int(qtys[i])} for i in range(len(items))]

            # Create and save a new activity
            new_activity = OrgActivity(**form_data)
            db.session.add(new_activity)
            db.session.commit()

            # Handle media file uploads
            files = request.files.getlist("file[]")  # Get all files
            captions = request.form.getlist("media_caption[]")  # Get all captions

            # Loop through each file and its corresponding caption
            for i in range(len(files)):
                if i < len(captions):  # Ensure there is a caption for the file
                    file = files[i]
                    caption = captions[i]

                    if allowed_file(file.filename):
                        file.seek(0)  # Ensure we read the file from the start
                        file_extension = os.path.splitext(file.filename)[1]
                        new_filename = f"{uuid.uuid4()}{file_extension}"
                        media_type = get_media_type_from_extension(new_filename)

                        minio_file_url = upload_file_to_minio(os.getenv("MINIO_BUCKET_NAME"), file, new_filename)
                        if not minio_file_url:
                            return jsonify({"message": "Error uploading file to MinIO"}), 500

                        # Save the media record linked to the activity
                        new_media = OrgMedia(
                            org_id=form_data["org_id"],
                            media_type=media_type,
                            media_url=minio_file_url,
                            media_caption=caption,  # Use the corresponding caption
                            activity_id=new_activity.id,
                            created_by=form_data["created_by"],
                            created_at=datetime.utcnow()
                        )
                        db.session.add(new_media)

            # Save items after processing media
            for item_qty in item_qty_pairs:
                new_item = ActivityItem(
                    org_id=form_data["org_id"],
                    activity_id=new_activity.id,
                    item=item_qty["item"],
                    qty=item_qty["qty"]
                )
                db.session.add(new_item)

            db.session.commit()

            # Complete audit log with all fields from `Activity`
            audit_data = {
                "user_id": g.user["id"],
                "first_name": g.user["first_name"],
                "last_name": g.user["last_name"],
                "pfs_num": g.user["pfs_num"],
                "user_email": g.user["email"],
                "event": "add_activity",
                "auditable_id": new_activity.id,
                "old_values": None,
                "new_values": json.dumps({
                    "type_id": form_data["type_id"],
                    "org_id": form_data["org_id"],
                    "title": form_data("title"),
                    "crime_id": form_data["crime_id"],
                    "casualties_recorded": form_data["casualties_recorded"],
                    "nature_of_attack": form_data["nature_of_attack"],
                    "location": form_data["location"],
                    "action_taken": form_data["action_taken"],
                    "location_from": form_data["location_from"],
                    "location_to": form_data["location_to"],
                    "facilitator": form_data["facilitator"],
                    "comment": form_data["comment"],
                    "activity_date": form_data["activity_date"],
                    "created_by": form_data["created_by"]
                }),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Activity, Create",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }

            save_audit_data(audit_data)

            return jsonify({"message": "Activity added successfully"}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding activity", "error": str(e)}), 500

        finally:
            db.session.close()


@custom_jwt_required
@permission_required
def get_activity(activity_id):
    # Fetch the activity by ID, ensuring it's not deleted
    activity = OrgActivity.query.filter_by(id=activity_id, deleted_at=None).first()
    
    if activity:
        # Fetch the associated POI details
        org = Organisation.query.filter_by(id=activity.poi_id).first()
        if org:
            org_name = f"{org.org_name}".strip()
        else:
            poi_name = "Unknown POI"

        # Fetch the name of the user who created the record
        created_by = User.query.filter_by(id=activity.created_by, deleted_at=None).first()
        created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"

        # Fetch associated items from `ActivityItem` table
        activity_items = ActivityItem.query.filter_by(activity_id=activity.id, org_id=org.id).all()
        items_data = [{"item": item.item, "qty": item.qty} for item in activity_items] if activity_items else []

        # Fetch associated media files from `PoiMedia` table
        media_files = OrgMedia.query.filter_by(activity_id=activity.id).all()
        media_data = [
            {
                "media_url": urljoin(os.getenv("MINIO_IMAGE_ENDPOINT", "/"), media.media_url) if media.media_url else None,
                "media_type": media.media_type,
                "media_caption": media.media_caption,
                "activity_id": media.activity_id,
                "created_by": media.created_by,
                "created_at": media.created_at.isoformat()
            }
            for media in media_files
        ] if media_files else []

        # Prepare the response data including the fetched items and media
        activity_data = {
                "id": activity.id,
                "org_id": activity.org_id,
                "title": activity.title,
                "crime_id": activity.crime_id,
                "casualties_recorded": activity.casualties_recorded,
                "nature_of_attack": activity.nature_of_attack,
                "location": activity.location,
                "action_taken": activity.action_taken,
                "comment": activity.comment,
                "location_from": activity.location_from,
                "location_to": activity.location_to,
                "facilitator": activity.facilitator,
                "comment": activity.comment,
                "activity_date": activity.activity_date.isoformat() if activity.activity_date else None,
                "created_by_id": activity.created_by,
                "created_by_name": created_by_name,
                "items": items_data,  # Add items belonging to the activity
                "media_files": media_data  # Add media files associated with the activity
            }

        # Audit logging
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_activity",
            "auditable_id": activity.id,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Activity, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"activity": activity_data}), 200
    else:
        return jsonify({"message": "Activity not found"}), 404


@custom_jwt_required
@permission_required
def edit_activity(activity_id):
    activity = OrgActivity.query.filter_by(id=activity_id, deleted_at=None).first()

    if not activity:
        return jsonify({"message": "Activity not found"}), 404

    if request.method == "PUT":
        # Form data
        type_id = request.form.get("type_id")
        org_id = request.form.get("org_id")
        title = request.form.get("title")
        crime_id = request.form.get("crime_id")
        casualties_recorded = request.form.get("casualties_recorded")
        nature_of_attack = request.form.get("nature_of_attack")
        location = request.form.get("location")
        action_taken = request.form.get("action_taken")
        location_from = request.form.get("location_from")
        location_to = request.form.get("location_to")
        facilitator = request.form.get("facilitator")
        comment = request.form.get("comment")
        activity_date = request.form.get("activity_date")
        created_by = g.user["id"]

        # Update basic activity details
        activity.type_id = type_id if type_id else activity.type_id
        activity.org_id = org_id if org_id else activity.org_id
        activity.title = title if title else activity.title 
        activity.crime_id = crime_id if crime_id else activity.crime_id
        activity.casualties_recorded = casualties_recorded if casualties_recorded else activity.casualties_recorded 
        activity.nature_of_attack = nature_of_attack if nature_of_attack else activity.nature_of_attack 
        activity.location = location if location else activity.location
        activity.action_taken = action_taken if action_taken else activity.action_taken
        activity.location_from = location_from if location_from else location_from
        activity.location_to = location_to if location_to else activity.location_to
        activity.facilitator = facilitator if facilitator else activity.facilitator 
        activity.comment = comment if comment else activity.comment
        activity.activity_date = activity_date if activity_date else  activity.activity_date
        activity.updated_at = datetime.utcnow()

        # Getting updated items and quantities as lists
        items = request.form.getlist("items[]")
        qtys = request.form.getlist("qtys[]")

        # Check if there are any items first
        if items:
            # Validate that items and quantities match in length
            if not qtys or len(items) != len(qtys):
                return jsonify({"message": "Items or quantities missing or mismatched"}), 400
            # Ensure all qtys are valid numbers
            try:
                qtys = [int(qty) for qty in qtys] 
            except ValueError:
                return jsonify({"message": "Quantities must be valid numbers"}), 400
            
        # Remove old items for this activity
        ActivityItem.query.filter_by(activity_id=activity.id, org_id=activity.org_id).delete()

        # Add new items for the activity
        item_qty_pairs = [{"item": items[i], "qty": int(qtys[i])} for i in range(len(items))]
        for item_qty in item_qty_pairs:
            new_item = ActivityItem(
                org_id=org_id,
                activity_id=activity.id,
                item=item_qty["item"],
                qty=item_qty["qty"]
            )
            db.session.add(new_item)

        # Handle media file update (if any files are uploaded)
        files = request.files.getlist("file[]")  # Get all uploaded files
        captions = request.form.getlist("media_caption[]")  # Get all captions

        # Delete existing media for this activity
        PoiMedia.query.filter_by(activity_id=activity.id).delete()

        # Loop through each file and its corresponding caption
        for i in range(len(files)):
            file = files[i]
            if file.filename != '' and allowed_file(file.filename):
                file.seek(0)

                # Generate a new filename using UUID
                file_extension = os.path.splitext(file.filename)[1]
                new_filename = f"{uuid.uuid4()}{file_extension}"
                media_type = get_media_type_from_extension(new_filename)
                minio_file_url = upload_file_to_minio(os.getenv("MINIO_BUCKET_NAME"), file, new_filename)

                if not minio_file_url:
                    return jsonify({"message": "Error uploading file to MinIO"}), 500

                if i < len(captions):  # Ensure there is a caption for the file
                    media_caption = captions[i]
                    # Save new media record linked to the updated activity
                    new_media = OrgMedia(
                        org_id=org_id,
                        media_type=media_type,
                        media_url=minio_file_url,
                        media_caption=media_caption,
                        activity_id=activity.id,
                        created_by=created_by,
                        created_at=datetime.utcnow()
                    )
                    db.session.add(new_media)

        try:
            db.session.commit()

            # Audit logging for editing activity
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "edit_activity",
                "auditable_id": activity.id,
                "old_values": None,
                "new_values": json.dumps({
                    "type_id": type_id,
                    "org_id": org_id,
                    "title": title,
                    "crime_id": crime_id,
                    "casualties_recorded": casualties_recorded,
                    "nature_of_attack": nature_of_attack,
                    "location": location,
                    "action_taken": action_taken,
                    "location_from": location_from,
                    "location_to": location_to,
                    "facilitator": facilitator,
                    "comment": comment,
                    "activity_date": activity_date,
                    "created_by": created_by
                }),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Activity, Edit",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)

            return jsonify({"message": "Activity updated successfully"}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error updating activity", "error": str(e)}), 500

        finally:
            db.session.close()


@custom_jwt_required
@permission_required
def delete_activity(activity_id):
    try:
        activity = OrgActivity.query.filter_by(id=activity_id, deleted_at=None).first()

        if not activity:
            return jsonify({"message": "Activity not found"}), 404

        # Soft delete activity by setting deleted_at to the current timestamp
        activity.soft_delete()
        db.session.commit()
        
        # Soft delete associated items
        ActivityItem.query.filter_by(activity_id=activity.id, org_id=activity.org_id).update({'deleted_at': datetime.utcnow()})
        db.session.commit()
        
        # Soft delete associated media
        OrgMedia.query.filter_by(activity_id=activity.id).update({'deleted_at': datetime.utcnow()})
        db.session.commit()
        
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
            "tags": "Activity, Delete",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        db.session.commit()
        return jsonify({"message": "Activity deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting activity", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
@permission_required
def restore_activity(activity_id):
    try:
        activity = OrgActivity.query.filter(
            OrgActivity.id == activity_id,
            OrgActivity.deleted_at != None
        ).first()

        if not activity:
            return jsonify({"message": "Activity not found or not deleted"}), 404

        # Restore the soft-deleted record by setting deleted_at to None
        activity.deleted_at = None
        db.session.commit()
        
        # Restore associated items
        ActivityItem.query.filter_by(activity_id=activity.id, org_id=activity.org_id).update({'deleted_at': None})
        db.session.commit()
        
        # Restore associated media
        OrgMedia.query.filter_by(activity_id=activity.id).update({'deleted_at': None})
        db.session.commit()
        
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
            "tags": "Activity, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }
        save_audit_data(audit_data)

        db.session.commit()
        return jsonify({"message": "Activity restored successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring activity", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
@permission_required
def get_activities_by_org(org_id):
    try:
        # Get search and pagination parameters from request arguments
        search_term = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 9, type=int)

        # Query activities directly linked to the organization
        org_activities_query = OrgActivity.query.filter_by(org_id=org_id, deleted_at=None)

        # Query activities related to POIs that belong to the organization
        poi_ids = Poi.query.with_entities(Poi.id).filter_by(organisation_id=org_id, deleted_at=None).subquery()
        poi_activities_query = Activity.query.filter(Activity.poi_id.in_(poi_ids), Activity.deleted_at == None)

        # Apply search filters if a search term is provided
        if search_term:
            search_pattern = f"%{search_term}%"
            org_activities_query = org_activities_query.filter(OrgActivity.title.ilike(search_pattern) | OrgActivity.comment.ilike(search_pattern) | OrgActivity.location.ilike(search_pattern) | OrgActivity.location_from.ilike(search_pattern) | OrgActivity.location_to.ilike(search_pattern) | OrgActivity.nature_of_attack.ilike(search_pattern) | OrgActivity.facilitator.ilike(search_pattern))
            poi_activities_query = poi_activities_query.filter(Activity.title.ilike(search_pattern) | Activity.comment.ilike(search_pattern))

        # Order both queries by activity_date in descending order
        org_activities_query = org_activities_query.order_by(OrgActivity.activity_date.desc())
        poi_activities_query = poi_activities_query.order_by(Activity.activity_date.desc())

        # Apply pagination to both queries
        org_activities_paginated = org_activities_query.paginate(page=page, per_page=per_page, error_out=False)
        poi_activities_paginated = poi_activities_query.paginate(page=page, per_page=per_page, error_out=False)

        # Combine the paginated activities from both organization and POI
        org_activities = org_activities_paginated.items
        poi_activities = poi_activities_paginated.items

        # Prepare the list of activities to return
        activity_list = []

        # Process organization activities
        for activity in org_activities:
            created_by = User.query.filter_by(id=activity.created_by, deleted_at=None).first()
            created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"

            activity_items = ActivityItem.query.filter_by(activity_id=activity.id, org_id=org_id).all()
            items_data = [{"item": item.item, "qty": item.qty} for item in activity_items] if activity_items else []

            media_files = OrgMedia.query.filter_by(activity_id=activity.id).all()
            media_data = [
                {
                    "media_url": media.media_url,
                    "media_url": urljoin(os.getenv("MINIO_IMAGE_ENDPOINT"), media.media_url) if media.media_url else None,
                    "media_type": media.media_type,
                    "media_caption": media.media_caption,
                    "activity_id": media.activity_id,
                    "created_by": media.created_by,
                    "created_at": media.created_at.isoformat()
                }
                for media in media_files
            ] if media_files else []
            
            # Mapping type_id to activity types
            activity_type_mapping = {
                1: "Attack",
                2: "Procurement",
                3: "Items Carted Away",
                4: "Press Release",
                5: "Others"
            }

            # Get activity type based on type_id
            activity_type = activity_type_mapping.get(activity.type_id, "Unknown")
            
            activity_list.append({
                "id": activity.id,
                "type_id": activity.type_id,
                "activity_type": activity_type,
                "org_id": activity.org_id,
                "title": activity.title,
                "crime_id": activity.crime_id,
                "casualties_recorded": activity.casualties_recorded,
                "nature_of_attack": activity.nature_of_attack,
                "location": activity.location,
                "action_taken": activity.action_taken,
                "comment": activity.comment,
                "location_from": activity.location_from,
                "location_to": activity.location_to,
                "facilitator": activity.facilitator,
                "activity_date": activity.activity_date.isoformat() if activity.activity_date else None,
                "created_by_id": activity.created_by,
                "created_by_name": created_by_name,
                "items": items_data,
                "media_files": media_data,
                "source": 'Organisation'
            })

        # Process POI activities
        for activity in poi_activities:
            created_by = User.query.filter_by(id=activity.created_by, deleted_at=None).first()
            created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"

            activity_items = ActivityItem.query.filter_by(activity_id=activity.id, poi_id=activity.poi_id).all()
            items_data = [{"item": item.item, "qty": item.qty} for item in activity_items] if activity_items else []
                        
            poi_ref = Poi.query.filter_by(id=activity.poi_id, deleted_at=None).first()
            poi_ref_name = f"{poi_ref.ref_numb}" if poi_ref else "Unknown User"
            
            media_files = PoiMedia.query.filter_by(activity_id=activity.id).all()
            media_data = [
                {
                    "media_url": urljoin(os.getenv("MINIO_IMAGE_ENDPOINT"), media.media_url) if media.media_url else None,
                    "media_type": media.media_type,
                    "media_caption": media.media_caption,
                    "activity_id": media.activity_id,
                    "created_by": media.created_by,
                    "created_at": media.created_at.isoformat()
                }
                for media in media_files
            ] if media_files else []

            # Mapping type_id to activity types
            activity_type_mapping = {
                1: "Attack",
                2: "Procurement",
                3: "Items Carted Away",
                4: "Press Release",
                5: "Others"
            }

            # Get activity type based on type_id
            activity_type = activity_type_mapping.get(activity.type_id, "Unknown")
            
            activity_list.append({
                "id": activity.id,
                "type_id": activity.type_id,
                "poi_id": activity.poi_id,
                "title": activity.title,
                "crime_id": activity.crime_id,
                "casualties_recorded": activity.casualties_recorded,
                "nature_of_attack": activity.nature_of_attack,
                "location": activity.location,
                "action_taken": activity.action_taken,
                "comment": activity.comment,
                "location_from": activity.location_from,
                "location_to": activity.location_to,
                "facilitator": activity.facilitator,
                "activity_date": activity.activity_date.isoformat() if activity.activity_date else None,
                "created_by_id": activity.created_by,
                "created_by_name": created_by_name,
                "items": items_data,
                "media_files": media_data,
                "activity_type": activity_type,
                "source": f"POI ({poi_ref_name or ''})".strip()
            })

        # Return paginated results, including metadata for pagination
        return jsonify({
            "status": "success",
            "status_code": 200,
            "current_page": page,
            "activities": activity_list,
            "pages": org_activities_paginated.pages,
            "per_page": per_page,
            "total": org_activities_paginated.total,
            "total_poi_pages": poi_activities_paginated.pages,
            "total_poi_items": poi_activities_paginated.total
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

