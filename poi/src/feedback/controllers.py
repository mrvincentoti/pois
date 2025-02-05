from flask import request, jsonify, g, json, current_app
from .models import Feedback
from datetime import date, datetime as dt
from datetime import datetime
import json, os, uuid
from .. import db
from sqlalchemy import func 
from ..users.models import User
from ..util import save_audit_data, custom_jwt_required, upload_file_to_minio, permission_required, minio_client
from minio.error import S3Error

@custom_jwt_required
@permission_required
def create_feedback():
    data = request.form
    subject = data.get('subject')  
    feedback_text = data.get('feedback') 
    created_by = g.user["id"]

    # Handle the file upload
    if 'attachment' in request.files:
        file = request.files['attachment']
        if file.filename == '':
            return jsonify({'message': 'No selected attachment file'}), 400

        if allowed_file(file.filename):
            file_extension = os.path.splitext(file.filename)[1]
            new_filename = f"{uuid.uuid4()}{file_extension}"  

            picture_url = upload_file_to_minio(os.getenv("MINIO_BUCKET_NAME"), file, new_filename)
        
            if not picture_url:
                return jsonify({'message': 'Error uploading attachment to MinIO'}), 500
        else:
            return jsonify({'message': 'Picture file type not allowed'}), 400
    else:
        picture_url = None  

    response = {}
    try:
        # Create Feedback instance
        feedback = Feedback(
            subject=subject,
            feedback=feedback_text,
            attachment=picture_url,
            status=0, 
            created_by=created_by,
            created_at=dt.utcnow()
        )

        db.session.add(feedback)
        db.session.commit()

        # Audit logging
        audit_data = {
            "user_id": g.user["id"],
            "first_name": g.user["first_name"],
            "last_name": g.user["last_name"],
            "user_email": g.user["email"],
            "event": "add_feedback",
            "auditable_id": feedback.id,
            "old_values": None,
            "new_values": json.dumps({
                "subject": feedback.subject,
                "feedback": feedback.feedback,
                "attachment": feedback.attachment,
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Feedback, Create",
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }

        save_audit_data(audit_data)

        response["status"] = "success"
        response["status_code"] = 201
        response["message"] = "Feedback sent successfully"
    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        response["status"] = "error"
        response["status_code"] = 500
        response["message"] = f"An error occurred while sending the feedback: {str(e)}"

    return jsonify(response), response["status_code"]


@custom_jwt_required
@permission_required
def get_feedbacks():
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    search_term = request.args.get('q', default=None, type=str)
    from_date = request.args.get('from_date', type=str)
    to_date = request.args.get('to_date', type=str)

    response = {}

    try:
        query = Feedback.query.filter_by(deleted_at=None)

        # Apply search filter
        if search_term:
            search = f"%{search_term}%"
            query = query.filter(
                (Feedback.subject.ilike(search)) |
                (Feedback.feedback.ilike(search))
            )

        # Apply date filter
        if from_date:
            from_date = datetime.strptime(from_date, '%Y-%m-%d')
            query = query.filter(Feedback.created_at >= from_date)
        if to_date:
            to_date = datetime.strptime(to_date, '%Y-%m-%d')
            query = query.filter(Feedback.created_at <= to_date)

        # Sort and paginate results
        query = query.order_by(Feedback.created_at.desc())
        paginated_feedback = query.paginate(page=page, per_page=per_page, error_out=False)

        # Format response
        feedback_list = []
        for feedback in paginated_feedback.items:
            created_by = User.query.filter_by(id=feedback.created_by, deleted_at=None).first()
            created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"
            feedback_data = {
                "id": feedback.id,
                "subject": feedback.subject,
                "feedback": feedback.feedback,
                "attachment": feedback.attachment,
                "status": feedback.status,
                "created_by": feedback.created_by,
                "created_by_name": created_by_name, 
                "created_at": feedback.created_at.isoformat() if feedback.created_at else None,
            }
            feedback_list.append(feedback_data)

        response = {
            'total': paginated_feedback.total,
            'pages': paginated_feedback.pages,
            'current_page': paginated_feedback.page,
            'feedbacks': feedback_list,
            'status': 'success',
            'status_code': 200
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"],
            "first_name": g.user["first_name"],
            "last_name": g.user["last_name"],
            "user_email": g.user["email"],
            "event": "view_feedbacks",
            "auditable_id": None,
            "old_values": None,
            "new_values": json.dumps({
                "searched_term": search_term,
                "from_date": from_date,
                "to_date": to_date
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Feedback, View",
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

    except Exception as e:
        db.session.rollback()
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred while fetching the feedbacks: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)


@custom_jwt_required
@permission_required
def get_feedback(feedback_id):
    response = {}
    try:
        feedback = Feedback.query.get_or_404(feedback_id)
        created_by = User.query.filter_by(id=feedback.created_by, deleted_at=None).first()
        created_by_name = f"{created_by.username} ({created_by.email})" if created_by else "Unknown User"
        
        # Fetch file size from MinIO
        file_size_str = "Unknown"  # Default value to prevent reference errors
        try:
            if feedback.attachment:  # Ensure attachment is not None
                file_name = feedback.attachment.split("/")[-1]  # Extract filename
                stat_info = minio_client.stat_object(os.getenv("MINIO_BUCKET_NAME"), file_name)
                file_size = round(stat_info.size / (1024 * 1024), 2)
                file_size_str = f"{file_size} MB"
            else:
                file_size_str = "No attachment available"
        except S3Error as e:
            print(f"Error fetching file size for {feedback.attachment}: {str(e)}")
            file_size_str = "Error fetching file size"
        
        feedback_data = {
            "id": feedback.id,
            "subject": feedback.subject,
            "attachment": feedback.attachment,
            "feedback": feedback.feedback,
            "status": feedback.status,
            "file_size": file_size_str, 
            "created_by": feedback.created_by,
            "created_by_name": created_by_name,
            "deleted_at": feedback.deleted_at.isoformat() if feedback.deleted_at else None,
            "created_at": feedback.created_at.isoformat() if feedback.created_at else None,
        }

        response = {
            "status": "success",
            "status_code": 200,
            "feedback": feedback_data,
        }

        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "view_feedback",
            "auditable_id": feedback_id,
            "old_values": None,
            "new_values": json.dumps(feedback_data, default=str),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Feedback, View",
            "created_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)
    except Exception as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred: {str(e)}",
        }
    return jsonify(response), response.get("status_code", 500)


@custom_jwt_required
@permission_required
def update_feedback(feedback_id):
    data = request.get_json() 
    response = {}

    try:
        feedback = Feedback.query.get(feedback_id)
        if feedback:
            old_status = feedback.status
            new_status = data.get('status')

            if new_status is None:
                return jsonify({'message': 'Status is required'}), 400

            feedback.status = new_status
            db.session.commit()

            # Audit logging
            current_time = dt.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "update_feedback_status",
                "auditable_id": feedback.id,
                "old_values": json.dumps({"status": old_status}),
                "new_values": json.dumps({"status": new_status}),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Feedback, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }
            save_audit_data(audit_data)

            response["status"] = "success"
            response["status_code"] = 200
            response["message"] = "Feedback status updated successfully"
        else:
            response = {
                "status": "error",
                "status_code": 404,
                "message": "Feedback not found",
            }

            # Audit logging for not found case
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "event": "update_feedback_not_found",
                "auditable_id": feedback_id,
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "created_at": dt.utcnow().isoformat(),
                "updated_at": dt.utcnow().isoformat(),
            }
            save_audit_data(audit_data)

    except Exception as e:
        db.session.rollback()
        response["status"] = "error"
        response["status_code"] = 500
        response["message"] = f"An error occurred while updating the feedback: {str(e)}"

        # Audit logging for error case
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "update_feedback_error",
            "auditable_id": feedback_id,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

    return jsonify(response), response["status_code"]


@custom_jwt_required
@permission_required
def delete_feedback(feedback_id):
    response = {}
    try:
        feedback = Feedback.query.get_or_404(feedback_id)
        feedback.soft_delete() 
        db.session.commit()

        response = {
            'status': 'success',
            'status_code': 200,
            'message': 'Feedback deleted successfully'
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "delete_feedback",
            "auditable_id": feedback.id,
            "old_values": json.dumps(feedback.to_dict(), default=str), 
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Feedback, Delete",
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
            "event": "delete_feedback",
            "auditable_id": feedback.id,
            "old_values": json.dumps(feedback.to_dict(), default=str), 
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Feedback, View",
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
@permission_required
def restore_feedback(feedback_id):
    response = {}
    try:
        feedback = Feedback.query.get_or_404(feedback_id)

        if feedback.deleted_at is None:
            return jsonify({
                'status': 'error',
                'status_code': 400,
                'message': 'Feedback is not deleted'
            }), 400

        feedback.deleted_at = None  # Restore the feedback
        db.session.commit()

        response = {
            'status': 'success',
            'status_code': 200,
            'message': 'Feedback restored successfully'
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_feedback",
            "auditable_id": feedback.id,
            "old_values": json.dumps(feedback.to_dict(), default=str), 
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Feedback, View",
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
    highest_ref_numb = db.session.query(func.max(Feedback.ref_numb)).scalar()
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
