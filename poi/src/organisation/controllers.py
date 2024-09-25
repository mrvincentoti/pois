from flask import request, jsonify, g, json, current_app
from .models import Organisation, db
from datetime import date, datetime as dt
from datetime import datetime
import json, os, uuid
from .. import db
from sqlalchemy import func 
from ..util import save_audit_data, custom_jwt_required, upload_file_to_minio, delete_picture_file, save_picture_file

@custom_jwt_required
def create_organisation():
    data = request.form
    ref_numb = generate_unique_ref_numb()  # Generate a unique reference number
    reg_numb = data.get('reg_numb')
    org_name = data.get('org_name')
    date_of_registration = data.get('date_of_registration')
    address = data.get('address')
    hq = data.get('hq')
    nature_of_business = data.get('nature_of_business')
    phone_number = data.get('phone_number')
    countries_operational = data.get('countries_operational')
    investors = data.get('investors')
    ceo = data.get('ceo')
    board_of_directors = data.get('board_of_directors')
    employee_strength = data.get('employee_strength')
    affiliations = data.get('affiliations')
    website = data.get('website')
    fb = data.get('fb')
    instagram = data.get('instagram')
    twitter = data.get('twitter')
    telegram = data.get('telegram')
    tiktok = data.get('tiktok')
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
        # Create Organisation instance
        organisation = Organisation(
            ref_numb=ref_numb,
            reg_numb=reg_numb,
            org_name=org_name,
            date_of_registration=date_of_registration,
            address=address,
            hq=hq,
            nature_of_business=nature_of_business,
            phone_number=phone_number,
            countries_operational=countries_operational,
            investors=investors,
            ceo=ceo,
            board_of_directors=board_of_directors,
            employee_strength=employee_strength,
            affiliations=affiliations,
            website=website,
            fb=fb,
            instagram=instagram,
            twitter=twitter,
            telegram=telegram,
            tiktok=tiktok,
            category_id=category_id,
            source_id=source_id,
            remark=remark,
            picture=picture_url,
            created_by=created_by
        )

        db.session.add(organisation)
        db.session.commit()

        date_of_registration_str = organisation.date_of_registration.isoformat() if isinstance(organisation.date_of_registration, (date, dt)) else organisation.date_of_registration
        
        # Audit logging
        current_time = dt.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "add_organisation",
            "auditable_id": organisation.id,
            "old_values": None,
            "new_values": json.dumps({
                "ref_numb": organisation.ref_numb,
                "org_name": organisation.org_name,
                "date_of_registration": date_of_registration_str,
                "address": organisation.address,
                "hq": organisation.hq,
                "nature_of_business": organisation.nature_of_business,
                "phone_number": organisation.phone_number,
                "countries_operational": organisation.countries_operational,
                "investors": organisation.investors,
                "ceo": organisation.ceo,
                "board_of_directors": organisation.board_of_directors,
                "employee_strength": organisation.employee_strength,
                "affiliations": organisation.affiliations,
                "website": organisation.website,
                "fb": organisation.fb,
                "instagram": organisation.instagram,
                "twitter": organisation.twitter,
                "telegram": organisation.telegram,
                "tiktok": organisation.tiktok,
                "category_id": organisation.category_id,
                "source_id": organisation.source_id,
                "remark": organisation.remark,
                "picture": organisation.picture,
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Organisation, Create",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        response["status"] = "success"
        response["status_code"] = 201
        response["message"] = "Organisation created successfully"
    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        response["status"] = "error"
        response["status_code"] = 500
        response["message"] = f"An error occurred while creating the organisation: {str(e)}"

    return jsonify(response), response["status_code"]


@custom_jwt_required
def get_organisations():
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    search_term = request.args.get('q', default=None, type=str)

    response = {}

    try:
        query = Organisation.query

        # Filter based on search term if supplied
        if search_term:
            search = f"%{search_term}%"
            query = query.filter(
                (Organisation.ref_numb.ilike(search)) |
                (Organisation.reg_numb.ilike(search)) |
                (Organisation.org_name.ilike(search)) |
                (Organisation.address.ilike(search)) |
                (Organisation.hq.ilike(search)) |
                (Organisation.nature_of_business.ilike(search)) |
                (Organisation.phone_number.ilike(search)) |
                (Organisation.countries_operational.ilike(search)) |
                (Organisation.investors.ilike(search)) |
                (Organisation.ceo.ilike(search)) |
                (Organisation.board_of_directors.ilike(search)) |
                (Organisation.employee_strength.ilike(search)) |
                (Organisation.affiliations.ilike(search))|
                (Organisation.website.ilike(search)) |
                (Organisation.fb.ilike(search)) |
                (Organisation.instagram.ilike(search)) |
                (Organisation.twitter.ilike(search)) |
                (Organisation.telegram.ilike(search)) |
                (Organisation.tiktok.ilike(search)) |
                (Organisation.remark.ilike(search))
            )

        # Pagination
        paginated_org = query.paginate(page=page, per_page=per_page, error_out=False)

        # Format response
        org_list = []
        for org in paginated_org.items:
            org_data = org.to_dict()
            org_data['source'] = org.source.to_dict() if org.source else None  # Add source object
            org_data['category'] = org.category.to_dict() if org.category else None  # Add category object
            org_list.append(org_data)

        response = {
            'total': paginated_org.total,
            'pages': paginated_org.pages,
            'current_page': paginated_org.page,
            'orgs': org_list,
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
            "event": "view_organisations",
            "auditable_id": None,
            "old_values": None,
            "new_values": json.dumps({"searched_term": search_term}),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Organisation, View",
            "created_at": dt.utcnow().isoformat(),
            "updated_at": dt.utcnow().isoformat(),
        }
        save_audit_data(audit_data)

    except Exception as e:
        db.session.rollback()
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred while fetching the organisations: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)


@custom_jwt_required
def get_organisation(organisation_id):
    response = {}
    try:
        organisation = Organisation.query.get_or_404(organisation_id)

        # Prepare the organisation data including source and category
        org_data = organisation.to_dict()
        org_data['source'] = organisation.source.to_dict() if organisation.source else None
        org_data['category'] = organisation.category.to_dict() if organisation.category else None

        response = {
            'status': 'success',
            'status_code': 200,
            'organisation': org_data
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "view_organisation",
            "auditable_id": organisation.id,
            "old_values": None,
            "new_values": json.dumps({"org_id": organisation.id}),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Organisation, View",
            "created_at": dt.utcnow().isoformat(),
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
def update_organisation(org_id):
    data = request.form
    organisation = Organisation.query.get(org_id)
    response = {}

    try:
        if organisation:
            # Handle the file upload for the organisation's picture (if applicable)
            if 'picture' in request.files:
                file = request.files['picture']
                if file.filename == '':
                    return jsonify({'message': 'No selected picture file'}), 400

                if allowed_file(file.filename):
                    # Delete the existing picture if it exists
                    if organisation.picture:
                        delete_picture_file(organisation.picture)

                    # Save the new picture file and update the URL
                    organisation.picture = save_picture_file(file)
                else:
                    return jsonify({'message': 'Picture file type not allowed'}), 400

            # Update other fields of the organisation
            organisation.update(
                ref_numb=data.get('ref_numb'),
                reg_numb=data.get('reg_numb'),
                org_name=data.get('org_name'),
                address=data.get('address'),
                hq=data.get('hq'),
                nature_of_business=data.get('nature_of_business'),
                phone_number=data.get('phone_number'),
                countries_operational=data.get('countries_operational'),
                investors=data.get('investors'),
                ceo=data.get('ceo'),
                board_of_directors=data.get('board_of_directors'),
                employee_strength=data.get('employee_strength'),
                affiliations=data.get('affiliations'),
                website=data.get('website'),
                fb=data.get('fb'),
                instagram=data.get('instagram'),
                twitter=data.get('twitter'),
                telegram=data.get('telegram'),
                tiktok=data.get('tiktok'),
                remark=data.get('remark'),
                category_id=data.get('category_id'),
                source_id=data.get('source_id'),
                deleted_at=data.get('deleted_at') 
            )

            current_time = dt.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "update_organisation",
                "auditable_id": organisation.id,
                "old_values": json.dumps({
                    "ref_numb": organisation.ref_numb,
                    "org_name": organisation.org_name,
                    "address": organisation.address,
                    "hq": organisation.hq,
                    "nature_of_business": organisation.nature_of_business,
                    "phone_number": organisation.phone_number,
                    "investors": organisation.investors,
                    "ceo": organisation.ceo,
                    "employee_strength": organisation.employee_strength,
                    "affiliations": organisation.affiliations,
                    "deleted_at": organisation.deleted_at,
                    "picture": organisation.picture,
                }, default=str),
                "new_values": json.dumps({
                    "ref_numb": organisation.ref_numb,
                    "org_name": organisation.org_name,
                    "address": organisation.address,
                    "hq": organisation.hq,
                    "nature_of_business": organisation.nature_of_business,
                    "phone_number": organisation.phone_number,
                    "investors": organisation.investors,
                    "ceo": organisation.ceo,
                    "employee_strength": organisation.employee_strength,
                    "affiliations": organisation.affiliations,
                    "deleted_at": organisation.deleted_at,
                    "picture": organisation.picture,
                }, default=str),  # Convert datetime fields
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Organisation, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)

            response["status"] = "success"
            response["status_code"] = 200
            response["message"] = "Organisation updated successfully"
        else:
            response = {
                "status": "error",
                "status_code": 404,
                "message": "Organisation not found",
            }

            current_time = dt.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "event": "update_organisation_not_found",
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
        response["message"] = f"An error occurred while updating the organisation: {str(e)}"

        current_time = dt.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "update_organisation_error",
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
def delete_organisation(org_id):
    response = {}
    try:
        organisation = Organisation.query.get_or_404(org_id)
        organisation.soft_delete() 
        db.session.commit()

        response = {
            'status': 'success',
            'status_code': 200,
            'message': 'Organisation deleted successfully'
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "delete_organisation",
            "auditable_id": organisation.id,
            "old_values": json.dumps(organisation.to_dict(), default=str), 
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Organisation, Delete",
            "created_at": dt.utcnow().isoformat(), 
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
def restore_organisation(org_id):
    response = {}
    try:
        organisation = Organisation.query.get_or_404(org_id)

        if organisation.deleted_at is None:
            return jsonify({
                'status': 'error',
                'status_code': 400,
                'message': 'Organisation is not deleted'
            }), 400

        organisation.deleted_at = None  # Restore the organisation
        db.session.commit()

        response = {
            'status': 'success',
            'status_code': 200,
            'message': 'Organisation restored successfully'
        }

        # Audit logging
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "restore_organisation",
            "auditable_id": organisation.id,
            "old_values": json.dumps({"deleted_at": dt.utcnow().isoformat()}),
            "new_values": json.dumps(organisation.to_dict(), default=str), 
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Organisation, Restore",
            "created_at": dt.utcnow().isoformat(),
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
    highest_ref_numb = db.session.query(func.max(Organisation.ref_numb)).scalar()
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

def save_picture_file(file):
    # Generate a new filename using UUID
    file_extension = os.path.splitext(file.filename)[1]  # Get the file extension
    new_filename = f"{uuid.uuid4()}{file_extension}"  # Create a new unique filename
    file_path = os.path.join(current_app.config['POI_PICTURE_UPLOAD_FOLDER'], new_filename)
    
    # Save the file to the POI_PICTURE_UPLOAD_FOLDER
    file.save(file_path)

    # Return the URL path for the saved file
    return f"poi/storage/media/{new_filename}"

def delete_picture_file(picture_url):
    # Construct the full file path from the picture URL
    file_path = os.path.join(current_app.config['POI_PICTURE_UPLOAD_FOLDER'], os.path.basename(picture_url))
    
    try:
        if os.path.exists(file_path):
            os.remove(file_path)  # Delete the file
    except Exception as e:
        # Log the error if needed
        print(f"Error deleting picture file {file_path}: {str(e)}")