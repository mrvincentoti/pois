from flask import request, jsonify, g, json, current_app
from .models import Brief
from datetime import date, datetime as dt
from datetime import datetime
import json, os, uuid
from .. import db
from sqlalchemy import func 
from ..util import save_audit_data, custom_jwt_required, upload_file_to_minio, delete_picture_file, save_picture_file

@custom_jwt_required
def create_brief():
    data = request.form
    ref_numb = generate_unique_ref_numb()  # Generate a unique reference number
    title = data.get('title')
    category_id = data.get('category_id')
    source_id = data.get('source_id')
    remark = data.get('remark')
    created_by = g.user["id"] 

    # Handle the file upload
    if 'picture' in request.files:
        file = request.files['picture']
        if file.filename == '':
            return jsonify({'message': 'No selected picture file'}), 400

        if allowed_file(file.filename):
            # Generate a new filename using UUID
            file_extension = os.path.splitext(file.filename)[1]  # Get the file extension
            new_filename = f"{uuid.uuid4()}{file_extension}"  # Create a new unique filename

            # Upload the file to MinIO
            picture_url = upload_file_to_minio(os.getenv("MINIO_BUCKET_NAME"), file, new_filename)
        
            if not picture_url:
                return jsonify({'message': 'Error uploading picture to MinIO'}), 500
        else:
            return jsonify({'message': 'Picture file type not allowed'}), 400
    else:
        picture_url = None  # No picture uploaded

    response = {}
    try:
        # Create Brief instance
        brief = Brief(
            ref_numb=ref_numb,
            title=title,
            category_id=category_id,
            source_id=source_id,
            remark=remark,
            picture=picture_url,
            created_by=created_by
        )

        db.session.add(brief)
        db.session.commit()

        # Audit logging
        current_time = dt.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "add_brief",
            "auditable_id": brief.id,
            "old_values": None,
            "new_values": json.dumps({
                "ref_numb": brief.ref_numb,
                "title": brief.title,
                "category_id": brief.category_id,
                "source_id": brief.source_id,
                "remark": brief.remark,
                "picture": brief.picture,
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Brief, Create",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        response["status"] = "success"
        response["status_code"] = 201
        response["message"] = "Brief created successfully"
    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        response["status"] = "error"
        response["status_code"] = 500
        response["message"] = f"An error occurred while creating the brief: {str(e)}"

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_briefs():
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    search_term = request.args.get('q', default=None, type=str)

    # New filter parameters
    category_id = request.args.get('category_id', type=int)
    source_id = request.args.get('source_id', type=int)
    from_date = request.args.get('from_date', type=str)
    to_date = request.args.get('to_date', type=str)

    response = {}

    try:
        query = Brief.query

        # Apply search term filter
        if search_term:
            search = f"%{search_term}%"
            query = query.filter(
                (Brief.ref_numb.ilike(search)) |
                (Brief.title.ilike(search)) |
                (Brief.remark.ilike(search))
            )

        # Apply category filter
        if category_id:
            query = query.filter(Brief.category_id == category_id)

        # Apply source filter
        if source_id:
            query = query.filter(Brief.source_id == source_id)
            
        # Apply date created range filter
        if from_date:
            from_date = datetime.strptime(from_date, '%Y-%m-%d')
            query = query.filter(Brief.created_at >= from_date)
        if to_date:
            to_date = datetime.strptime(to_date, '%Y-%m-%d')
            query = query.filter(Brief.created_at <= to_date)

        # Sort and paginate the results
        query = query.order_by(Brief.created_at.desc())
        paginated_brief = query.paginate(page=page, per_page=per_page, error_out=False)

        # Format response
        brief_list = []
        for brief in paginated_brief.items:
            brief_data = brief.to_dict()
            brief_data['source'] = brief.source.to_dict() if brief.source else None
            brief_data['category'] = brief.category.to_dict() if brief.category else None
            brief_list.append(brief_data)

        response = {
            'total': paginated_brief.total,
            'pages': paginated_brief.pages,
            'current_page': paginated_brief.page,
            'briefs': brief_list,
            'status': 'success',
            'status_code': 200
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "view_briefs",
            "auditable_id": None,
            "old_values": None,
            "new_values": json.dumps({
                "searched_term": search_term,
                "category_id": category_id,
                "source_id": source_id,
                "from_date": from_date,
                "to_date": to_date
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Brief, View",
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

    except Exception as e:
        db.session.rollback()
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred while fetching the briefs: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)


@custom_jwt_required
def get_brief(brief_id):
    response = {}
    try:
        brief = Brief.query.get_or_404(brief_id)

        # Prepare the brief data including source and category
        brief_data = brief.to_dict()
        brief_data['source'] = brief.source.to_dict() if brief.source else None
        brief_data['category'] = brief.category.to_dict() if brief.category else None

        response = {
            'status': 'success',
            'status_code': 200,
            'brief': brief_data
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "view_brief",
            "auditable_id": None,
            "old_values": None,
            "new_values": json.dumps({
                "title": brief.title,
                "brief_id": brief.id,
                "category_id": brief.category_id,
                "source_id": brief.source_id
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Brief, View",
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

    except Exception as e:
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)


@custom_jwt_required
def update_brief(org_id):
    data = request.form
    brief = Brief.query.get(org_id)
    response = {}

    try:
        if brief:
            # Handle the file upload for the brief's picture (if applicable) 
            if 'picture' in request.files:
                file = request.files['picture']

                # Check if a filename was provided
                if file.filename == '':
                    return jsonify({'message': 'No selected picture file'}), 400

                # Check if the uploaded file is allowed
                if allowed_file(file.filename):
                    # Delete the old picture file from MinIO (if necessary)
                    old_picture_key = os.path.basename(brief.picture)
                    try:
                        minio_client.remove_object(os.getenv("MINIO_BUCKET_NAME"), old_picture_key)
                    except Exception as e:
                        print(f"Error deleting old picture from MinIO: {e}")

                    # Generate a new filename using UUID
                    file_extension = os.path.splitext(file.filename)[1]  # Get the original file extension
                    new_filename = f"{uuid.uuid4()}{file_extension}"  # Generate a new filename

                    # Upload the new picture to MinIO
                    minio_file_url = upload_file_to_minio(os.getenv("MINIO_BUCKET_NAME"), file, new_filename)
                    if not minio_file_url:
                        return jsonify({"message": "Error uploading picture to MinIO"}), 500

                    # Save the new picture URL in the brief's picture field
                    brief.picture = minio_file_url
                else:
                    return jsonify({'message': 'Picture file type not allowed'}), 400

            # Update other fields of the brief
            brief.update(
                ref_numb=data.get('ref_numb'),
                title=data.get('title'),
                remark=data.get('remark'),
                category_id=data.get('category_id'),
                source_id=data.get('source_id')
            )

            current_time = dt.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "update_brief",
                "auditable_id": brief.id,
                "old_values": json.dumps({
                    "ref_numb": brief.ref_numb,
                    "title": brief.title,
                    "remark": brief.remark,
                    "picture": brief.picture,
                }, default=str),
                "new_values": json.dumps({
                    "ref_numb": brief.ref_numb,
                    "title": brief.title,
                    "remark": brief.remark,
                    "picture": brief.picture,
                }, default=str),  # Convert datetime fields
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Brief, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)

            response["status"] = "success"
            response["status_code"] = 200
            response["message"] = "Brief updated successfully"
        else:
            response = {
                "status": "error",
                "status_code": 404,
                "message": "Brief not found",
            }

            current_time = dt.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "event": "update_brief_not_found",
                "auditable_id": org_id,
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)

    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        response["status"] = "error"
        response["status_code"] = 500
        response["message"] = f"An error occurred while updating the brief: {str(e)}"

        current_time = dt.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "update_brief_error",
            "auditable_id": org_id,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

    return jsonify(response), response["status_code"]


@custom_jwt_required
def delete_brief(org_id):
    response = {}
    try:
        brief = Brief.query.get_or_404(org_id)
        brief.soft_delete() 
        db.session.commit()

        response = {
            'status': 'success',
            'status_code': 200,
            'message': 'Brief deleted successfully'
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "delete_brief",
            "auditable_id": brief.id,
            "old_values": json.dumps(brief.to_dict(), default=str), 
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Brief, Delete",
            "created_at": dt.utcnow().isoformat(), 
        }
        save_audit_data(audit_data)
        
        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "delete_brief",
            "auditable_id": None,
            "old_values": json.dumps(brief.to_dict(), default=str), 
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Brief, View",
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

    except Exception as e:
        db.session.rollback()
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)


@custom_jwt_required
def restore_brief(org_id):
    response = {}
    try:
        brief = Brief.query.get_or_404(org_id)

        if brief.deleted_at is None:
            return jsonify({
                'status': 'error',
                'status_code': 400,
                'message': 'Brief is not deleted'
            }), 400

        brief.deleted_at = None  # Restore the brief
        db.session.commit()

        response = {
            'status': 'success',
            'status_code': 200,
            'message': 'Brief restored successfully'
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_brief",
            "auditable_id": None,
            "old_values": json.dumps(brief.to_dict(), default=str), 
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Brief, View",
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

    except Exception as e:
        db.session.rollback()
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)


def generate_unique_ref_numb():
    # Query to get the highest existing ref_numb
    highest_ref_numb = db.session.query(func.max(Brief.ref_numb)).scalar()
    if highest_ref_numb is None:
        return "REF001"  # Starting point if no POIs exist
    else:
        # Extract the numeric part, increment it, and format it back to string
        num_part = int(highest_ref_numb[3:]) + 1  # Assuming "REF" is the prefix
        return f"REF{num_part:03}"  # Format to maintain leading zeros

def allowed_file(filename):
    # Define allowed file extensions
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions
