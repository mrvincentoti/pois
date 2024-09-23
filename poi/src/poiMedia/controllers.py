import os
import uuid
from .. import db
from .models import PoiMedia
from datetime import datetime
from ..util import custom_jwt_required, save_audit_data
from flask import jsonify, request, g, json, current_app
from werkzeug.utils import secure_filename

@custom_jwt_required
def get_all_media():
    try:
        medias = PoiMedia.query.all()

        media_list = []
        for media in medias:
            media_data = media.to_dict()
            media_list.append(media_data)

        return jsonify({
            "status": "success",
            "status_code": 200,
            'medias': media_list,
        })
    except Exception as e:
        return jsonify({'error': str(e)})


@custom_jwt_required
def get_media(media_id):
    media_record = PoiMedia.query.filter_by(id=media_id, deleted_at=None).first()

    if media_record is None:
        return jsonify({"message": "Media not found"}), 404

    media_data = {
        "id": media_record.id,
        "poi_id": media_record.poi_id,
        "media_type": media_record.media_type,
        "media_url": media_record.media_url,
        "created_by": media_record.created_by,
        "created_at": media_record.created_at.isoformat() if media_record.created_at else None,
    }

    return jsonify({"media": media_data}), 200



@custom_jwt_required
def add_poi_media(poi_id):
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400

    if 'media_type' not in request.form:
        return jsonify({'message': 'Media type is required'}), 400
    
    file = request.files['file']
    created_by = g.user["id"]

    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # Generate a new filename using UUID
        file_extension = os.path.splitext(file.filename)[1]  # Get the original file extension
        new_filename = f"{uuid.uuid4()}{file_extension}"  # Generate a new filename
        #media_type = file.content_type 
        media_type = request.form.get('media_type')
        file_path = os.path.join(current_app.config['MEDIA_UPLOAD_FOLDER'], new_filename)
        
        # Save the file to the UPLOAD_FOLDER
        file.save(file_path)

        # Adjust media_url to reflect the static storage path
        media_url = f"static/storage/media/{new_filename}"

        # Insert into database
        new_media = PoiMedia(
            poi_id=poi_id,
            media_type=media_type,
            media_url=media_url,
            created_by=created_by,
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_media)
        db.session.commit()

        return jsonify({'message': 'File successfully uploaded', 'media_url': media_url}), 201

    return jsonify({'message': 'File type not allowed'}), 400


@custom_jwt_required
def get_poi_media(poi_id):
    try:
        # Query the database for media associated with the given poi_id
        media_records = PoiMedia.query.filter_by(poi_id=poi_id, deleted_at=None).all()

        # Check if any media records were found
        if not media_records:
            return jsonify({"message": "No media found for the given POI"}), 404

        # Prepare the list of media to return
        media_list = []
        for media in media_records:
            media_data = {
                "media_id": media.id,
                "media_type": media.media_type,
                "media_url": media.media_url,
                "created_by": media.created_by,
                "created_at": media.created_at.isoformat() if media.created_at else None
            }
            media_list.append(media_data)

        # Return the list of media with status success
        return jsonify({
            "status": "success",
            "status_code": 200,
            "media": media_list,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@custom_jwt_required
def edit_media(media_id):
    media_record = PoiMedia.query.filter_by(id=media_id, deleted_at=None).first()

    if media_record is None:
        return jsonify({"message": "Media not found"}), 404

    if 'file' in request.files:
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400

        if allowed_file(file.filename):
            # Delete the old file
            old_file_path = os.path.join(current_app.config['MEDIA_UPLOAD_FOLDER'], os.path.basename(media_record.media_url))
            if os.path.exists(old_file_path):
                os.remove(old_file_path)

            # Generate a new filename using UUID
            file_extension = os.path.splitext(file.filename)[1]  # Get the original file extension
            new_filename = f"{uuid.uuid4()}{file_extension}"  # Generate a new filename
            #media_type = file.content_type 
            media_type = request.form.get('media_type') 
            file_path = os.path.join(current_app.config['MEDIA_UPLOAD_FOLDER'], new_filename)
            
            # Save the new file
            file.save(file_path)

            # Update media record with new information
            media_record.media_type = media_type
            media_record.media_url = f"static/storage/media/{new_filename}"
            
            db.session.commit()

            return jsonify({'message': 'Media successfully updated', 'media_url': media_record.media_url}), 200
    
    return jsonify({'message': 'File type not allowed'}), 400


@custom_jwt_required
def delete_media(media_id):
    media_record = PoiMedia.query.filter_by(id=media_id, deleted_at=None).first()

    if media_record is None:
        return jsonify({"message": "Media not found"}), 404

    try:
        # Soft delete the media record
        media_record.soft_delete()
        db.session.commit()

        return jsonify({"message": "Media deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting media", "error": str(e)}), 500
    finally:
        db.session.close()


def allowed_file(filename):
    # Define allowed file extensions
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'pdf'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions