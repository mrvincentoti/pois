import os
import uuid
from .. import db
from .models import OrgMedia
from ..organisation.models import Organisation
from datetime import datetime
from dotenv import load_dotenv
from ..util import custom_jwt_required, save_audit_data, upload_file_to_minio, get_media_type_from_extension, delete_picture_file, allowed_file, permission_required, minio_client
from flask import jsonify, request, g, json
from werkzeug.utils import secure_filename
from urllib.parse import urljoin
from ..poi.models import Poi
from ..poiMedia.models import PoiMedia
from minio.error import S3Error

load_dotenv()

@custom_jwt_required
@permission_required
def get_media(media_id):
    # Fetch the media record
    media_record = OrgMedia.query.filter_by(id=media_id, deleted_at=None).first()

    if media_record is None:
        return jsonify({"message": "Media not found", "media": []}), 200

    # Prepare media data
    media_data = {
        "id": media_record.id,
        "org_id": media_record.org_id,
        "media_caption": media_record.media_caption,
        "media_type": media_record.media_type,
        "media_url": urljoin(os.getenv("MINIO_IMAGE_ENDPOINT"), media_record.media_url) if media_record.media_url else None,
        "created_by": media_record.created_by,
        "created_at": media_record.created_at.isoformat() if media_record.created_at else None,
    }

    # Log audit event
    try:
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_media",
            "auditable_id": media_record.id,
            "old_values": None,
            "new_values": json.dumps(media_data),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Media, Fetch",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

    except Exception as e:
        return jsonify({"message": "Error logging audit data", "error": str(e)}), 500

    # Return media data
    return jsonify({"media": media_data}), 200


@custom_jwt_required
@permission_required
def add_org_media(org_id):
    org = Organisation.query.filter_by(id=org_id, deleted_at=None).first()

    if org is None:
        return jsonify({"message": "Organisation not found", "Organisation": []}), 200
    
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400
    
    file = request.files['file']
    created_by = g.user["id"]

    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # Generate a new filename using UUID
        file_extension = os.path.splitext(file.filename)[1]
        new_filename = f"{uuid.uuid4()}{file_extension}"
        media_type = get_media_type_from_extension(new_filename)
        media_caption = request.form.get('media_caption')
        activity_id = request.form.get('activity_id')

        # Upload the file to MinIO
        minio_file_url = upload_file_to_minio(os.getenv("MINIO_BUCKET_NAME"), file, new_filename)
        if not minio_file_url:
            return jsonify({"message": "Error uploading file to MinIO"}), 500

        # Insert into database
        new_media = OrgMedia(
            org_id=org_id,
            media_type=media_type,
            media_url=minio_file_url,
            media_caption=media_caption,
            activity_id=activity_id,
            created_by=created_by,
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_media)
        db.session.commit()

        # Log audit event
        try:
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "add_org_media",
                "auditable_id": new_media.id,
                "old_values": None,
                "new_values": json.dumps({
                    "org_id": new_media.org_id,
                    "media_type": new_media.media_type,
                    "media_url": new_media.media_url,
                    "media_caption": new_media.media_caption
                }),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Media, Add",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)

        except Exception as e:
            return jsonify({"message": "Error logging audit data", "error": str(e)}), 500

        return jsonify({'message': 'File successfully uploaded', 'media_url': minio_file_url}), 201

    return jsonify({'message': 'File type not allowed'}), 400


@custom_jwt_required
@permission_required
def get_org_media(org_id):
    try:
        # Get search and pagination parameters from request arguments
        search_term = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 9, type=int)

        # Query media files directly linked to the organization activities
        org_media_query = OrgMedia.query.filter_by(org_id=org_id, deleted_at=None)

        # Query media files related to POIs that belong to the organization
        poi_ids = Poi.query.with_entities(Poi.id).filter_by(organisation_id=org_id, deleted_at=None).subquery()
        poi_media_query = PoiMedia.query.filter(PoiMedia.poi_id.in_(poi_ids), PoiMedia.deleted_at == None)

        # Apply search filters if a search term is provided
        if search_term:
            search_pattern = f"%{search_term}%"
            org_media_query = org_media_query.filter(OrgMedia.media_caption.ilike(search_pattern))
            poi_media_query = poi_media_query.filter(PoiMedia.media_caption.ilike(search_pattern))

        # Order both queries by creation date in descending order
        org_media_query = org_media_query.order_by(OrgMedia.created_at.desc())
        poi_media_query = poi_media_query.order_by(PoiMedia.created_at.desc())

        # Apply pagination to both queries
        org_media_paginated = org_media_query.paginate(page=page, per_page=per_page, error_out=False)
        poi_media_paginated = poi_media_query.paginate(page=page, per_page=per_page, error_out=False)

        # Combine the paginated media from both organization and POI
        org_media_files = org_media_paginated.items
        poi_media_files = poi_media_paginated.items

        # Prepare the list of media files to return
        media_list = []

        # Process organization media files
        for media in org_media_files:   
            org = Organisation.query.filter_by(id=org_id).first()        
            file_size_str = None
            try:
                file_name = media.media_url.split("/")[-1]
                stat_info = minio_client.stat_object(os.getenv("MINIO_BUCKET_NAME"), file_name)
                file_size = round(stat_info.size / (1024 * 1024), 2)
                file_size_str = f"{file_size} MB"
            except S3Error as e:
                print(f"Error fetching file size for {media.media_url}: {str(e)}")

            media_list.append({
                "media_id": media.id,
                    "media_type": media.media_type,
                    "media_url": urljoin(os.getenv("MINIO_IMAGE_ENDPOINT", "/"), media.media_url) if media.media_url else None,
                    "media_caption": media.media_caption or 'No caption',
                    "file_size": file_size_str,
                    "org_id": org.id if org else None,
                    "org_name": org.org_name if org else 'Unknown',
                    "activity_id": media.activity_id,
                    "created_by": media.created_by,
                    "created_at": media.created_at.isoformat() if media.created_at else None,
                    "source": 'Organisation'
            })

        # Process POI media files
        for media in poi_media_files:
            poi_ref = Poi.query.filter_by(id=media.poi_id, deleted_at=None).first()
            poi_ref_name = f"{poi_ref.ref_numb}" if poi_ref else "Unknown POI"

            media_list.append({
                "media_id": media.id,
                "media_url": urljoin(os.getenv("MINIO_IMAGE_ENDPOINT", "/"), media.media_url) if media.media_url else None,
                "media_type": media.media_type,
                "media_caption": media.media_caption or 'No caption',
                "file_size": file_size_str,
                "activity_id": media.activity_id,
                "created_by": media.created_by,
                "created_at": media.created_at.isoformat(),
                "source": f"POI ({poi_ref_name})"
            })

        # Return paginated results, including metadata for pagination
        return jsonify({
            "status": "success",
            "status_code": 200,
            "current_page": page,
            "media": media_list,
            "pages": max(org_media_paginated.pages, poi_media_paginated.pages),
            "per_page": per_page,
            "total": org_media_paginated.total + poi_media_paginated.total,  
            "total_org_media": org_media_paginated.total,
            "total_poi_media": poi_media_paginated.total
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@custom_jwt_required
@permission_required
def edit_media(media_id):
    media_record = OrgMedia.query.filter_by(id=media_id, deleted_at=None).first()

    if media_record is None:
        return jsonify({"message": "Media not found", "media": []}), 200

    old_values = {
        "media_type": media_record.media_type,
        "media_url": media_record.media_url,
        "media_caption": media_record.media_caption,
        "activity_id": media_record.activity_id,
    }

    # Check if a file is in the request
    if 'file' in request.files:
        file = request.files['file']

        # Check if a filename was provided
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400

        # Check if the uploaded file is allowed
        if allowed_file(file.filename):
            # Delete the old file from MinIO (if necessary)
            old_file_key = os.path.basename(media_record.media_url)
            try:
                delete_picture_file(os.getenv("MINIO_BUCKET_NAME"), old_file_key)
            except Exception as e:
                print(f"Error deleting old file from MinIO: {e}")

            # Generate a new filename using UUID
            file_extension = os.path.splitext(file.filename)[1]  # Get the original file extension
            new_filename = f"{uuid.uuid4()}{file_extension}"  # Generate a new filename
            media_type = request.form.get('media_type') 
            media_caption = request.form.get('media_caption')
            activity_id = request.form.get('activity_id')

            # Upload the new file to MinIO
            minio_file_url = upload_file_to_minio(os.getenv("MINIO_BUCKET_NAME"), file, new_filename)
            if not minio_file_url:
                return jsonify({"message": "Error uploading file to MinIO"}), 500

            # Update media record with new information
            media_record.media_type = media_type
            media_record.media_url = minio_file_url
            media_record.media_caption = media_caption
            media_record.activity_id = activity_id

            db.session.commit()

            # Log audit event
            try:
                current_time = datetime.utcnow()
                audit_data = {
                    "user_id": g.user["id"] if hasattr(g, "user") else None,
                    "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                    "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                    "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                    "user_email": g.user["email"] if hasattr(g, "user") else None,
                    "event": "edit_media",
                    "auditable_id": media_id,
                    "old_values": json.dumps(old_values),
                    "new_values": json.dumps({
                        "media_type": media_record.media_type,
                        "media_url": media_record.media_url,
                        "media_caption": media_record.media_caption
                    }),
                    "url": request.url,
                    "ip_address": request.remote_addr,
                    "user_agent": request.user_agent.string,
                    "tags": "Media, Edit",
                    "created_at": current_time.isoformat(),
                    "updated_at": current_time.isoformat(),
                }

                save_audit_data(audit_data)

            except Exception as e:
                return jsonify({"message": "Error logging audit data", "error": str(e)}), 500

            return jsonify({'message': 'Media successfully updated', 'media_url': media_record.media_url}), 200
        else:
            return jsonify({'message': 'File type not allowed'}), 400

    # If no file was uploaded, allow updating other media details like type and caption
    media_type = request.form.get('media_type') 
    media_caption = request.form.get('media_caption')

    if media_type:
        media_record.media_type = media_type
    
    if media_caption:
        media_record.media_caption = media_caption

    db.session.commit()

    # Log audit event (when only details like type or caption were updated)
    try:
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "edit_media",
            "auditable_id": media_id,
            "old_values": json.dumps(old_values),
            "new_values": json.dumps({
                "media_type": media_record.media_type,
                "media_url": media_record.media_url,
                "media_caption": media_record.media_caption
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Media, Edit",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

    except Exception as e:
        return jsonify({"message": "Error logging audit data", "error": str(e)}), 500

    return jsonify({'message': 'Media successfully updated'}), 200


@custom_jwt_required
@permission_required
def delete_media(media_id):
    media_record = OrgMedia.query.filter_by(id=media_id, deleted_at=None).first()

    if media_record is None:
        return jsonify({"message": "Media not found", "media": []}), 200

    old_values = {
        "media_type": media_record.media_type,
        "media_url": media_record.media_url,
        "media_caption": media_record.media_caption,
    }

    try:
        # Soft delete the media record
        media_record.soft_delete()
        db.session.commit()

        # Log audit event for deletion
        try:
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "delete_media",
                "auditable_id": media_id,
                "old_values": json.dumps(old_values),
                "new_values": json.dumps({"deleted_at": media_record.deleted_at}),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Media, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
        except Exception as e:
            return jsonify({"message": "Error logging audit data", "error": str(e)}), 500

        return jsonify({"message": "Media deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting media", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
@permission_required
def restore_media(media_id):
    # Fetch the media record that was soft-deleted
    media_record = OrgMedia.query.filter_by(id=media_id).first()

    if media_record is None:
        return jsonify({"message": "Media not found", "media": []}), 200

    if media_record.deleted_at is None:
        return jsonify({"message": "Media is not deleted"}), 400

    old_values = {
        "deleted_at": media_record.deleted_at
    }

    try:
        # Restore the media by setting 'deleted_at' to None
        media_record.deleted_at = None
        media_record.updated_at = datetime.utcnow()  # Optionally update the 'updated_at' field

        # Commit the changes to the database
        db.session.commit()

        # Log audit event for restoration
        try:
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "restore_media",
                "auditable_id": media_id,
                "old_values": json.dumps(old_values),
                "new_values": json.dumps({"deleted_at": media_record.deleted_at}),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Media, Restore",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
        except Exception as e:
            return jsonify({"message": "Error logging audit data", "error": str(e)}), 500

        return jsonify({"message": "Media successfully restored"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring media", "error": str(e)}), 500

