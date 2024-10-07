from flask import request, jsonify,json, g
from sqlalchemy import or_, func
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import CrimeCommitted
from ..users.models import User
from ..poi.models import Poi
from ..util import custom_jwt_required, save_audit_data, minio_client
from ..poiMedia.models import PoiMedia
from ..poi.models import Poi
from .models import CrimeCommitted
from ..crimes.models import Crime
from minio.error import S3Error
from minio import Minio
import os
from ..armsRecovered.models import ArmsRecovered

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
        # Fetch the associated POI (Person of Interest) details
        poi = Poi.query.filter_by(id=crime_committed.poi_id).first()
        
        if poi:
            poi_name = f"{poi.first_name or ''} {poi.middle_name or ''} {poi.last_name or ''} ({poi.ref_numb or ''})".strip()
        
        # Crime committed data
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
            "deleted_at": crime_committed.deleted_at,
            "poi_name": poi_name
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
            poi = Poi.query.filter_by(id=crime.poi_id).first()
        
            if poi:
                poi_name = f"{poi.first_name or ''} {poi.middle_name or ''} {poi.last_name or ''} ({poi.ref_numb or ''})".strip()
            
            # Fetch the name of the user who created the crime record
            created_by = User.query.filter_by(id=crime.created_by, deleted_at=None).first()
            created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"

            total_media = PoiMedia.query.filter_by(crime_id=crime.id, deleted_at=None).count()
            total_arms = db.session.query(func.sum(ArmsRecovered.number_recovered)).filter_by(
                crime_id=crime.id).scalar()

            # Prepare data for each crime committed
            crime_data = {
                "id": crime.id,
                "crime_id": crime.crime_id,
                "poi_id": crime.poi_id,
                "poi_name": poi_name,
                "crime_date": crime.crime_date.isoformat() if crime.crime_date else None,
                "action_taken": crime.action_taken,
                "casualties_recorded": crime.casualties_recorded,
                "place_of_detention": crime.place_of_detention,
                "arresting_body_id": crime.arresting_body_id,
                "comments": crime.comments,
                "created_by_id": crime.created_by,
                "created_by_name": created_by_name,
                "total_media": total_media,
                "total_arms_recovered": total_arms,
                "crime": {
                    "id": crime.crime.id,
                    "name": crime.crime.name
                } if crime.crime else None,  # Include crime details if available
                "arresting_body": {
                    "id": crime.arresting_body.id,
                    "name": crime.arresting_body.name
                } if crime.arresting_body else None  # Include arresting body details if available
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


@custom_jwt_required
def get_crime_medias(crime_id):
    try:
        # Get pagination parameters from the request (default values: page=1, per_page=10)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # Query the database for media associated with the given crime_id, ordered by created_at descending, and paginate
        media_paginated = PoiMedia.query.filter_by(crime_id=crime_id, deleted_at=None)\
            .order_by(PoiMedia.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)

        # Check if any media records were found
        if not media_paginated.items:
            return jsonify({"message": "No media found for the given Crime", "media": []}), 200

        # Prepare the list of media to return
        media_list = []
        for media in media_paginated.items:
            poi = Poi.query.filter_by(id=media.poi_id).first()
            poi_name = f"{poi.first_name or ''} {poi.middle_name or ''} {poi.last_name or ''} ({poi.ref_numb or ''})".strip() if poi else None
            
            # Fetch the CrimeCommitted record
            crime_committed = CrimeCommitted.query.filter_by(id=media.crime_id).first()

            # Initialize crime_name as None
            crime_name = None

            # Proceed only if crime_committed is found
            if crime_committed:
                crime = Crime.query.filter_by(id=crime_committed.crime_id).first()
                crime_name = f"{crime.name or ''}".strip() if crime else None

            # Fetch file size from MinIO
            file_size = None
            try:
                # Extract the file name from the media URL
                file_name = media.media_url.split("/")[-1]  # Assuming the filename is the last part of the URL
                stat_info = minio_client.stat_object(os.getenv("MINIO_BUCKET_NAME"), file_name)
                file_size = round(stat_info.size / (1024 * 1024), 2)
                file_size_str = f"{file_size} MB"
            except S3Error as e:
                print(f"Error fetching file size for {media.media_url}: {str(e)}")

            media_data = {
                "media_id": media.id,
                "media_type": media.media_type,
                "media_url": media.media_url,
                "media_caption": media.media_caption or 'No caption',
                "poi_id": poi.id if poi else None,
                "poi_name": poi_name,
                "crime_id": media.crime_id,
                "crime_committed": crime_name,
                "created_by": media.created_by,
                "created_at": media.created_at.isoformat() if media.created_at else None,
                "file_size": file_size_str
            }
            media_list.append(media_data)

        # Prepare the paginated response
        response = {
            'total': media_paginated.total,
            'pages': media_paginated.pages,
            'current_page': media_paginated.page,
            'per_page': media_paginated.per_page,
            'media': media_list,
            'status': 'success',
            'status_code': 200
        }

        # Log audit event
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_poi_media",
            "auditable_id": media.poi_id,
            "old_values": None,
            "new_values": json.dumps({
                "media_records_count": len(media_list),
                "media_details": media_list
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Media, Retrieve",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

    except Exception as e:
        # Rollback any failed DB transaction and return error
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    return jsonify(response), response.get('status_code', 500)


@custom_jwt_required
def get_crime_arms(crime_id):
    try:
        # Get pagination and search parameters from request arguments
        search_term = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        query = ArmsRecovered.query.filter_by(crime_id=crime_id, deleted_at=None)

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