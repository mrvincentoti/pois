import os
import uuid
from .. import db
from .models import OrgMedia
from ..organisation.models import Organisation
from datetime import datetime
from dotenv import load_dotenv
from ..util import custom_jwt_required, save_audit_data, upload_file_to_minio, get_media_type_from_extension, delete_picture_file, allowed_file, permission_required
from flask import jsonify, request, g, json
from werkzeug.utils import secure_filename
from urllib.parse import urljoin
from ..poi.models import Poi
from ..poiMedia.models import PoiMedia

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
        # Extract pagination parameters from the request
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)

        # Query for organization's media
        org_media_query = OrgMedia.query.filter_by(org_id=org_id, deleted_at=None).order_by(OrgMedia.created_at.desc())

        # Query for media from POIs belonging to the organization
        poi_media_query = PoiMedia.query.join(Poi, Poi.id == PoiMedia.poi_id).filter(
            Poi.organisation_id == org_id, PoiMedia.deleted_at == None
        ).order_by(PoiMedia.created_at.desc())

        # Combine both media queries with pagination
        combined_media = org_media_query.union_all(poi_media_query)
        paginated_media = combined_media.paginate(page=page, per_page=per_page, error_out=False)

        # Check if any media records were found
        if not paginated_media.items:
            return jsonify({"message": "No media found for the given organization"}), 404

        # Prepare the list of media to return
        media_list = []
        for media in paginated_media.items:
            # Check if media is OrgMedia or PoiMedia and set appropriate values
            if isinstance(media, OrgMedia):
                org = Organisation.query.filter_by(id=media.org_id).first()
                media_data = {
                    "media_id": media.id,
                    "media_type": media.media_type,
                    "media_url": urljoin(os.getenv("MINIO_IMAGE_ENDPOINT"), media.media_url) if media.media_url else None,
                    "media_caption": media.media_caption or 'No caption',
                    "org_id": org.id if org else None,
                    "org_name": org.org_name if org else 'Unknown',
                    "activity_id": media.activity_id,
                    "created_by": media.created_by,
                    "created_at": media.created_at.isoformat() if media.created_at else None,
                    "source": 'Organisation'
                }
            elif isinstance(media, PoiMedia):
                poi = Poi.query.filter_by(id=media.poi_id).first()
                poi_name = f"{poi.first_name or ''} {poi.middle_name or ''} {poi.last_name or ''} ({poi.ref_numb or ''})".strip() if poi else 'Unknown'
                
                media_data = {
                    "media_id": media.id,
                    "media_type": media.media_type,
                    "media_url": urljoin(os.getenv("MINIO_IMAGE_ENDPOINT"), media.media_url) if media.media_url else None,
                    "media_caption": media.media_caption or 'No caption',
                    "poi_id": poi.id if poi else None,
                    "poi_name": poi_name,
                    "activity_id": media.activity_id,
                    "created_by": media.created_by,
                    "created_at": media.created_at.isoformat() if media.created_at else None,
                    "source": f"POI ({poi.ref_num or ''})".strip() if poi else 'Unknown'
                }

            media_list.append(media_data)

        # Log audit event
        try:
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "get_org_media",
                "auditable_id": org_id,
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
            return jsonify({"message": "Error logging audit data", "error": str(e)}), 500

        # Return the paginated media list with pagination details
        return jsonify({
            "status": "success",
            "status_code": 200,
            "media": media_list,
            "pagination": {
                "total": paginated_media.total,
                "pages": paginated_media.pages,
                "current_page": paginated_media.page,
                "per_page": paginated_media.per_page,
                "next_page": paginated_media.next_num if paginated_media.has_next else None,
                "prev_page": paginated_media.prev_num if paginated_media.has_prev else None
            }
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

