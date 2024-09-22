from flask import request, jsonify
from .models import PoiMedia
from ..util import custom_jwt_required, save_audit_data

@custom_jwt_required
def get_medias():
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
def upload_media(poi_id):
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400

    file = request.files['file']
    created_by = request.form.get('created_by')

    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        media_type = file.content_type 
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save the file to the UPLOAD_FOLDER
        file.save(file_path)
        
        media_url = f"/uploads/{filename}" 

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