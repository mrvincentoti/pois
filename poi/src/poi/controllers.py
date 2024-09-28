from flask import jsonify, request, g, json, current_app
from datetime import datetime as dt
from datetime import datetime
from .models import Poi
from .. import db
from ..util import save_audit_data, custom_jwt_required, upload_file_to_minio
import os
import uuid
from urllib.parse import urljoin
from werkzeug.utils import secure_filename
from sqlalchemy import func 
from ..crimesCommitted.models import CrimeCommitted
from ..armsRecovered.models import ArmsRecovered
from ..arms.models import Arm
from ..crimesCommitted.models import CrimeCommitted
from ..users.models import User
from sqlalchemy.orm import joinedload

# Create POI
@custom_jwt_required
def create_poi():
    data = request.form
    # data = request.get_json()
    # ref_numb = data.get('ref_numb')
    ref_numb = generate_unique_ref_numb()
    first_name = data.get('first_name')
    # print(first_name, flush=True)
    middle_name = data.get('middle_name')
    last_name = data.get('last_name')
    marital_status = data.get('marital_status')
    alias = data.get('alias')
    dob = data.get('dob')
    passport_number = data.get('passport_number')
    other_id_number = data.get('other_id_number')
    phone_number = data.get('phone_number')
    email = data.get('email')
    role = data.get('role')
    affiliation = data.get('affiliation')
    address = data.get('address')
    remark = data.get('remark')
    category_id = data.get('category_id')
    source_id = data.get('source_id')
    country_id = data.get('country_id')
    state_id = data.get('state_id')
    gender_id = data.get('gender_id')
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
        # Create POI instance
        poi = Poi(
            ref_numb=ref_numb,
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            alias=alias,
            picture=picture_url,
            dob=dob,
            passport_number=passport_number,
            other_id_number=other_id_number,
            phone_number=phone_number,
            email=email,
            role=role,
            affiliation=affiliation,
            address=address,
            remark=remark,
            category_id=category_id,
            source_id=source_id,
            country_id=country_id,
            state_id=state_id,
            gender_id=gender_id,
            marital_status= marital_status,
            created_by=created_by
        )

        db.session.add(poi)
        db.session.commit()

        # Audit logging
        current_time = dt.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "add_poi",
            "auditable_id": poi.id,
            "old_values": None,
            "new_values": json.dumps({
                "ref_numb": poi.ref_numb,
                "first_name": poi.first_name,
                "middle_name": poi.middle_name,
                "last_name": poi.last_name,
                "marital_status": poi.marital_status,
                "alias": poi.alias,
                "dob": poi.dob,
                "passport_number": poi.passport_number,
                "other_id_number": poi.other_id_number,
                "phone_number": poi.phone_number,
                "email": poi.email,
                "role": poi.role,
                "affiliation": poi.affiliation,
                "address": poi.address,
                "remark": poi.remark,
                "category_id": poi.category_id,
                "source_id": poi.source_id,
                "country_id": poi.country_id,
                "state_id": poi.state_id,
                "gender_id": poi.gender_id,
                "picture": poi.picture,
                "deleted_at": poi.deleted_at,  # Add new fields to audit logging if needed
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "POI, Poi, Create",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        response["status"] = "success"
        response["status_code"] = 201
        response["message"] = "POI created successfully"
    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        response["status"] = "error"
        response["status_code"] = 500
        response["message"] = f"An error occurred while creating the POI: {str(e)}"

    return jsonify(response), response["status_code"]

# Get POI by ID
@custom_jwt_required
def get_poi(poi_id):
    response = {}
    current_time = dt.utcnow()  # Get current time for logging

    try:
        poi = Poi.query.get(poi_id)
        if poi and not poi.deleted_at:
            crime_count = CrimeCommitted.query.filter_by(poi_id=poi_id).count()
            arms_count = ArmsRecovered.query.filter_by(poi_id=poi_id).count()

            poi_data = {
                "ref_numb": poi.ref_numb,
                "first_name": poi.first_name,
                "middle_name": poi.middle_name,
                "last_name": poi.last_name,
                "marital_status": poi.marital_status,
                "alias": poi.alias,
                "dob": poi.dob if poi.dob else None,
                "passport_number": poi.passport_number,
                "other_id_number": poi.other_id_number,
                "phone_number": poi.phone_number,
                "email": poi.email,
                "role": poi.role,
                "affiliation": poi.affiliation,
                "address": poi.address,
                "remark": poi.remark,
                "picture": urljoin(os.getenv("MINIO_IMAGE_ENDPOINT"), poi.picture) if poi.picture else None,
                "category": {
                    "id": poi.category.id,
                    "name": poi.category.name,
                } if poi.category else None,
                "source": {
                    "id": poi.source.id,
                    "name": poi.source.name,
                } if poi.source else None,
                "country": {
                    "id": poi.country.id,
                    "name": poi.country.en_short_name,
                } if poi.country else None,
                "state": {
                    "id": poi.state.id,
                    "name": poi.state.name,
                } if poi.state else None,
                "gender": {
                    "id": poi.gender.id,
                    "name": poi.gender.name,
                } if poi.gender else None,
                "crime_count": crime_count,
                "arms_count": arms_count,
            }

            response = {
                "status": "success",
                "status_code": 200,
                "poi_data": poi_data
            }

            # Audit logging for access event
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "event": "get_poi",
                "auditable_id": poi.id,
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)

        else:
            response = {
                "status": "error",
                "status_code": 404,
                "message": "POI not found",
            }

            # Log failed access attempt
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "event": "get_poi_not_found",
                "auditable_id": poi_id,
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)

    except Exception as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": "An error occurred while retrieving the POI.",
            "error": str(e)
        }

        # Log the exception during access
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "get_poi_error",
            "auditable_id": poi_id,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
            "error": str(e),
        }

        save_audit_data(audit_data)

    return jsonify(response), response["status_code"]

# Update POI
@custom_jwt_required
def update_poi(poi_id):
    data = request.form
    poi = Poi.query.get(poi_id)
    response = {}

    try:
        if poi:
            # Handle the file upload for the poi's picture (if applicable) 
            if 'picture' in request.files:
                file = request.files['picture']

                # Check if a filename was provided
                if file.filename == '':
                    return jsonify({'message': 'No selected picture file'}), 400

                # Check if the uploaded file is allowed
                if allowed_file(file.filename):
                    # Delete the old picture file from MinIO (if necessary)
                    # old_picture_key = os.path.basename(poi.picture)
                    # try:
                    #     remove_object_from_minio(old_picture_key)
                    # except Exception as e:
                    #     print(f"Error deleting old picture from MinIO: {e}")

                    # Generate a new filename using UUID
                    file_extension = os.path.splitext(file.filename)[1]  # Get the original file extension
                    new_filename = f"{uuid.uuid4()}{file_extension}"  # Generate a new filename

                    # Upload the new picture to MinIO
                    minio_file_url = upload_file_to_minio(os.getenv("MINIO_BUCKET_NAME"), file, new_filename)
                    if not minio_file_url:
                        return jsonify({"message": "Error uploading picture to MinIO"}), 500

                    # Save the new picture URL in the organisation's picture field
                    poi.picture = minio_file_url
                else:
                    return jsonify({'message': 'Picture file type not allowed'}), 400

            # Update other fields
            poi.update(
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
                marital_status=data.get('marital_status'),
                ref_numb=data.get('ref_numb'),
                dob=data.get('dob') or None,
                passport_number=data.get('passport_number'),
                other_id_number=data.get('other_id_number'),
                phone_number=data.get('phone_number') ,
                email=data.get('email'),
                role=data.get('role'),
                affiliation=data.get('affiliation'),
                address=data.get('address'),
                remark=data.get('remark'),
                middle_name=data.get('middle_name'),
                alias=data.get('alias'),
                category_id=data.get('category_id'),
                source_id=data.get('source_id'),
                country_id=data.get('country_id'),
                state_id=data.get('state_id'),
                gender_id=data.get('gender_id'),
                deleted_at=data.get('deleted_at')
            )

            current_time = dt.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event": "update_poi",
                "auditable_id": poi.id,
                "old_values": json.dumps({
                    "ref_numb": poi.ref_numb,
                    "first_name": poi.first_name,
                    "middle_name": poi.middle_name,
                    "marital_status": poi.marital_status,
                    "last_name": poi.last_name,
                    "alias": poi.alias,
                    "dob": poi.dob,
                    "passport_number": poi.passport_number,
                    "other_id_number": poi.other_id_number,
                    "phone_number": poi.phone_number,
                    "email": poi.email,
                    "role": poi.role,
                    "affiliation": poi.affiliation,
                    "address": poi.address,
                    "remark": poi.remark,
                    "category_id": poi.category_id,
                    "source_id": poi.source_id,
                    "country_id": poi.country_id,
                    "state_id": poi.state_id,
                    "gender_id": poi.gender_id,
                    "deleted_at": poi.deleted_at,
                    "picture": poi.picture,
                }),
                "new_values": json.dumps({
                    "ref_numb": poi.ref_numb,
                    "first_name": poi.first_name,
                    "middle_name": poi.middle_name,
                    "marital_status": poi.marital_status,
                    "last_name": poi.last_name,
                    "alias": poi.alias,
                    "dob": poi.dob,
                    "passport_number": poi.passport_number,
                    "other_id_number": poi.other_id_number,
                    "phone_number": poi.phone_number,
                    "email": poi.email,
                    "role": poi.role,
                    "affiliation": poi.affiliation,
                    "address": poi.address,
                    "remark": poi.remark,
                    "category_id": poi.category_id,
                    "source_id": poi.source_id,
                    "country_id": poi.country_id,
                    "state_id": poi.state_id,
                    "gender_id": poi.gender_id,
                    "deleted_at": poi.deleted_at,
                    "picture": poi.picture,
                }),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "POI, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)

            response["status"] = "success"
            response["status_code"] = 200 
            response["message"] = "POI updated successfully"
        else:
            response = {
                "status": "error",
                "status_code": 404,
                "message": "POI not found",
            }

            # Log failed update attempt
            current_time = dt.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "event": "update_poi_not_found",
                "auditable_id": poi_id,
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
        response["message"] = f"An error occurred while updating the POI: {str(e)}"

        # Log the exception during update
        current_time = dt.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "event": "update_poi_error",
            "auditable_id": poi_id,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

    return jsonify(response), response["status_code"]

# Soft Delete POI
@custom_jwt_required
def delete_poi(poi_id):
    poi = Poi.query.get(poi_id)
    if poi:
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "delete_poi",
            "auditable_id": poi.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "first_name": poi.first_name,
                    "middle_name": poi.middle_name,
                    "last_name": poi.last_name,
                    "alis": poi.alias
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "POI, Delete",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        poi.soft_delete()
        db.session.commit()
        return jsonify({'message': 'POI deleted successfully'}), 200
    return jsonify({'message': 'POI not found'}), 404

# Restore Soft-Deleted POI
@custom_jwt_required
def restore_poi(poi_id):
    poi = Poi.query.filter(Poi.id == poi_id, Poi.deleted_at != None).first()

    if poi is None:
        return jsonify({"message": "POI not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_poi",
            "auditable_id": poi.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "first_name": poi.first_name,
                    "middle_name": poi.middle_name,
                    "last_name": poi.last_name,
                    "alis": poi.alias
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "POI, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        poi.restore()
        db.session.commit()
        return (
            jsonify({"message": "POI restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring POI", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def list_pois():
    # Get pagination and search term from request parameters
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    search_term = request.args.get('q', default=None, type=str)

    # Query base
    query = Poi.query

    # Filter based on search term if supplied
    if search_term:
        search = f"%{search_term}%"
        query = query.filter(
            (Poi.ref_numb.ilike(search)) |
            (Poi.first_name.ilike(search)) |
            (Poi.middle_name.ilike(search)) |
            (Poi.last_name.ilike(search)) |
            (Poi.alias.ilike(search)) |
            (Poi.passport_number.ilike(search)) |
            (Poi.other_id_number.ilike(search)) |
            (Poi.phone_number.ilike(search)) |
            (Poi.email.ilike(search)) |
            (Poi.role.ilike(search)) |
            (Poi.address.ilike(search)) |
            (Poi.remark.ilike(search))
        )

    query = query.order_by(Poi.created_at.desc())

    # Pagination
    paginated_pois = query.paginate(page=page, per_page=per_page, error_out=False)

    pois_list = []

    for poi in paginated_pois.items:
        crime_count = len(poi.crimes) if hasattr(poi, 'crimes') else 0
        arms_count = len(poi.arms) if hasattr(poi, 'arms') else 0
        crimes_committed = CrimeCommitted.query.filter_by(poi_id=poi.id).first()
        created_by = User.query.filter_by(id=poi.created_by).first()

        crime_data = None
        arresting_body_data = None

        if crimes_committed:
            # Crime data
            if crimes_committed.crime:
                crime_data = {
                    "id": crimes_committed.crime.id,
                    "name": crimes_committed.crime.name
                }

            # Arresting body data
            if crimes_committed.arresting_body:
                arresting_body_data = {
                    "id": crimes_committed.arresting_body.id,
                    "name": crimes_committed.arresting_body.name
                }

        pois_list.append({
            "id": poi.id,
            "ref_numb": poi.ref_numb,
            "first_name": poi.first_name,
            "middle_name": poi.middle_name,
            "last_name": poi.last_name,
            "marital_status": poi.marital_status,
            "alias": poi.alias,
            "dob": poi.dob if poi.dob else None,
            "passport_number": poi.passport_number,
            "other_id_number": poi.other_id_number,
            "phone_number": poi.phone_number,
            "email": poi.email,
            "role": poi.role,
            "affiliation": poi.affiliation,
            "address": poi.address,
            "remark": poi.remark,
            "picture": urljoin(os.getenv("MINIO_IMAGE_ENDPOINT"), poi.picture) if poi.picture else None,
            "category": {
                "id": poi.category.id,
                "name": poi.category.name,
            } if poi.category else None,
            "source": {
                "id": poi.source.id,
                "name": poi.source.name,
            } if poi.source else None,
            "country": {
                "id": poi.country.id,
                "name": poi.country.en_short_name,
            } if poi.country else None,
            "state": {
                "id": poi.state.id,
                "name": poi.state.name,
            } if poi.state else None,
            "gender": {
                "id": poi.gender.id,
                "name": poi.gender.name,
            } if poi.gender else None,
            "crimes_committed": {
                "id": crimes_committed.id,
                "poi_id": crimes_committed.poi_id,
                "crime_id": crimes_committed.crime_id,
                "crime": crime_data,  # Including the Crime details here
                "arresting_body": arresting_body_data  # Including the ArrestingBody details here
            } if crimes_committed else [],
            "user": {
                "id": created_by.id,
                "username": created_by.username,
                "first_name": created_by.first_name,
                "last_name": created_by.last_name,
                "pfs_num": created_by.pfs_num,
            } if created_by else [],
            "crime_count": crime_count,
            "arms_count": arms_count,
        })

    current_time = datetime.utcnow()
    audit_data = {
        "user_id": g.user["id"] if hasattr(g, "user") else None,
        "first_name": g.user["first_name"] if hasattr(g, "user") else None,
        "last_name": g.user["last_name"] if hasattr(g, "user") else None,
        "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
        "user_email": g.user["email"] if hasattr(g, "user") else None,
        "event": "list_poi",
        "auditable_id": None,
        "old_values": None,
        "new_values": None,
        "url": request.url,
        "ip_address": request.remote_addr,
        "user_agent": request.user_agent.string,
        "tags": "POI, List",
        "created_at": current_time.isoformat(),
        "updated_at": current_time.isoformat(),
    }

    save_audit_data(audit_data)

    return jsonify({
        'total': paginated_pois.total,
        'pages': paginated_pois.pages,
        'current_page': paginated_pois.page,
        'pois': pois_list
    })

@custom_jwt_required
def filter_pois():
    # Get filter parameters from the request
    created_by = request.args.get('created_by', type=int)
    from_date = request.args.get('from_date', type=str)
    to_date = request.args.get('to_date', type=str)
    affiliation = request.args.get('affiliation', type=str)
    category_id = request.args.get('category_id', type=int)
    source_id = request.args.get('source_id', type=int)
    country_id = request.args.get('country_id', type=int)
    state_id = request.args.get('state_id', type=int)
    gender_id = request.args.get('gender_id', type=int)
    
    crime_id = request.args.get('crime_id', type=int) 
    arm_id = request.args.get('arm_id', type=int)
    arresting_body_id = request.args.get('arresting_body_id', type=int)

    query = Poi.query

    # Apply filters based on provided parameters
    if created_by:
        query = query.filter(Poi.created_by == created_by)

    if from_date:
        from_date = datetime.strptime(from_date, '%Y-%m-%d')  # Format: YYYY-MM-DD
        query = query.filter(Poi.created_at >= from_date)

    if to_date:
        to_date = datetime.strptime(to_date, '%Y-%m-%d')  # Format: YYYY-MM-DD
        query = query.filter(Poi.created_at <= to_date)

    if affiliation:
        query = query.filter(Poi.affiliation.ilike(f'%{affiliation}%'))

    if category_id:
        query = query.filter(Poi.category_id == category_id)

    if source_id:
        query = query.filter(Poi.source_id == source_id)

    if country_id:
        query = query.filter(Poi.country_id == country_id)

    if state_id:
        query = query.filter(Poi.state_id == state_id)

    if gender_id:
        query = query.filter(Poi.gender_id == gender_id)
    
    if arm_id:
        # Join with ArmsRecovered to filter based on the selected arm
        query = query.join(ArmsRecovered).filter(ArmsRecovered.arm_id == arm_id)

    if arresting_body_id:
        # Join with CrimeCommitted to filter based on the selected arresting body
        query = query.join(CrimeCommitted).filter(CrimeCommitted.arresting_body_id == arresting_body_id)

    if crime_id:
        # Join with CrimeCommitted to filter based on the selected crime
        query = query.join(CrimeCommitted).filter(CrimeCommitted.crime_id == crime_id)

    # Execute the query and get results
    pois = query.options(joinedload(Poi.category), joinedload(Poi.source), 
                        joinedload(Poi.country), joinedload(Poi.state), 
                        joinedload(Poi.gender)).all()

    # Execute the query and get results
    pois = query.all()

    # Convert results to a serializable format
    pois_data = [{
                "ref_numb": poi.ref_numb,
                "first_name": poi.first_name,
                "middle_name": poi.middle_name,
                "last_name": poi.last_name,
                "alias": poi.alias,
                "dob": poi.dob.strftime('%d/%m/%Y') if poi.dob else None,
                "passport_number": poi.passport_number,
                "other_id_number": poi.other_id_number,
                "phone_number": poi.phone_number,
                "email": poi.email,
                "role": poi.role,
                "affiliation": poi.affiliation,
                "address": poi.address,
                "remark": poi.remark,
                "picture": poi.picture,  # Include the picture URL
                "category": {
                    "id": poi.category.id,
                    "name": poi.category.name,
                } if poi.category else None,
                "source": {
                    "id": poi.source.id,
                    "name": poi.source.name,
                } if poi.source else None,
                "country": {
                    "id": poi.country.id,
                    "name": poi.country.en_short_name,
                } if poi.country else None,
                "state": {
                    "id": poi.state.id,
                    "name": poi.state.name,
                } if poi.state else None,
                "gender": {
                    "id": poi.gender.id,
                    "name": poi.gender.name,
                } if poi.gender else None
    } for poi in pois]

    return jsonify(pois_data), 200


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

def generate_unique_ref_numb():
    # Query to get the highest existing ref_numb
    highest_ref_numb = db.session.query(func.max(Poi.ref_numb)).scalar()
    if highest_ref_numb is None:
        return "REF001"  # Starting point if no POIs exist
    else:
        # Extract the numeric part, increment it, and format it back to string
        num_part = int(highest_ref_numb[3:]) + 1  # Assuming "REF" is the prefix
        return f"REF{num_part:03}"  # Format to maintain leading zeros