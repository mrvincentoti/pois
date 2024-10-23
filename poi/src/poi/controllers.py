from flask import jsonify, request, g, json, current_app
from datetime import datetime as dt
from datetime import datetime
from .models import Poi
from .. import db
from ..util import save_audit_data, custom_jwt_required, upload_file_to_minio, calculate_poi_age
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
from ..address.models import Address
from ..arrestingBody.models import ArrestingBody
from ..crimes.models import Crime
from ..affiliation.models import Affiliation
from ..activities.models import Activity
from sqlalchemy.orm import joinedload

# Create POI
@custom_jwt_required
def create_poi():
    data = request.form
    ref_numb = generate_unique_ref_numb()
    first_name = data.get('first_name')
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
    remark = data.get('remark')
    category_id = data.get('category_id')
    source_id = data.get('source_id')
    country_id = data.get('country_id')
    state_id = data.get('state_id')
    gender_id = data.get('gender_id')
    place_of_detention = data.get("place_of_detention")
    arresting_body_id = data.get("arresting_body_id")
    website = data.get('website')
    fb = data.get('fb')
    instagram = data.get('instagram')
    twitter = data.get('twitter')
    telegram = data.get('telegram')
    tiktok = data.get('tiktok')
    organisation_id = data.get("organisation_id")
    status_id = data.get('status_id')
    created_by = g.user["id"]

    # Address fields
    social_address = data.get('social_address')
    social_latitude = data.get('social_latitude')
    social_longitude = data.get('social_longitude')

    work_address = data.get('work_address')
    work_latitude = data.get('work_latitude')
    work_longitude = data.get('work_longitude')

    residential_address = data.get('residential_address')
    residential_latitude = data.get('residential_latitude')
    residential_longitude = data.get('residential_longitude')

    # Handle the file upload
    if 'picture' in request.files:
        file = request.files['picture']
        if file.filename == '':
            return jsonify({'message': 'No selected picture file'}), 400

        if allowed_file(file.filename):
            file_extension = os.path.splitext(file.filename)[1]
            new_filename = f"{uuid.uuid4()}{file_extension}"
            picture_url = upload_file_to_minio(os.getenv("MINIO_BUCKET_NAME"), file, new_filename)

            if not picture_url:
                return jsonify({'message': 'Error uploading picture to MinIO'}), 500
        else:
            return jsonify({'message': 'Picture file type not allowed'}), 400
    else:
        picture_url = None

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
            remark=remark,
            category_id=category_id,
            source_id=source_id,
            country_id=country_id,
            state_id=state_id,
            gender_id=gender_id,
            place_of_detention=place_of_detention,
            arresting_body_id=arresting_body_id,
            organisation_id=organisation_id,
            website=website,
            fb=fb,
            instagram=instagram,
            twitter=twitter,
            telegram=telegram,
            tiktok=tiktok,
            marital_status=marital_status,
            status_id=status_id,
            created_by=created_by
        )

        db.session.add(poi)
        db.session.commit()

        # Prepare to save addresses if the fields are provided
        addresses = []

        if social_address:
            addresses.append(
                Address(
                    poi_id=poi.id,
                    address_type='social',
                    address=social_address,
                    latitude=social_latitude,
                    longitude=social_longitude
                )
            )

        if work_address:
            addresses.append(
                Address(
                    poi_id=poi.id,
                    address_type='work',
                    address=work_address,
                    latitude=work_latitude,
                    longitude=work_longitude
                )
            )

        if residential_address:
            addresses.append(
                Address(
                    poi_id=poi.id,
                    address_type='residential',
                    address=residential_address,
                    latitude=residential_latitude,
                    longitude=residential_longitude
                )
            )

        # Only save addresses if any complete address was provided
        if addresses:
            db.session.add_all(addresses)
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
                "remark": poi.remark,
                "category_id": poi.category_id,
                "source_id": poi.source_id,
                "country_id": poi.country_id,
                "state_id": poi.state_id,
                "gender_id": poi.gender_id,
                "place_of_detention": poi.place_of_detention,
                "arresting_body_id": poi.arresting_body_id,
                "organisation_id": poi.organisation_id,
                "website": poi.website,
                "fb": poi.fb,
                "instagram": poi.instagram,
                "twitter": poi.twitter,
                "telegram": poi.telegram,
                "tiktok": poi.tiktok,
                "picture": poi.picture,
                "social_address": social_address,
                "social_latitude": social_latitude,
                "social_longitude": social_longitude,
                "work_address": work_address,
                "work_latitude": work_latitude,
                "work_longitude": work_longitude,
                "residential_address": residential_address,
                "residential_latitude": residential_latitude,
                "residential_longitude": residential_longitude,
                "status_id": status_id,
                "deleted_at": poi.deleted_at,
            }),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "POI, Create",
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
            # Retrieve address information and structure by address type
            addresses = Address.query.filter_by(poi_id=poi_id).all()
            address_data = {
                "work": None,
                "social": None,
                "residential": None
            }

            for address in addresses:
                if address.address_type in address_data:
                    if address.address:
                        address_data[address.address_type] = {
                            "address": address.address,
                            "latitude": address.latitude,
                            "longitude": address.longitude,
                            "created_at": address.created_at,
                            "updated_at": address.updated_at
                        }

            crime_count = CrimeCommitted.query.filter_by(poi_id=poi_id).count()
            arms_count = ArmsRecovered.query.filter_by(poi_id=poi_id).count()

            affiliation_ids = [int(aff_id) for aff_id in poi.affiliation.split(",") if aff_id] if poi.affiliation is not None else []
            affiliations = Affiliation.query.filter(Affiliation.id.in_(affiliation_ids)).all()
            affiliation_names = [affiliation.name for affiliation in affiliations]
            affiliation_names_str = ", ".join(affiliation_names)

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
                "affiliation": affiliation_names_str,
                "affiliation_ids": poi.affiliation,
                "remark": poi.remark,
                "website": poi.website,
                "fb": poi.fb,
                "instagram": poi.instagram,
                "twitter": poi.instagram,
                "telegram": poi.telegram,
                "tiktok": poi.tiktok,
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
                "place_of_detention": poi.place_of_detention,
                "arresting_body": {
                    "id": poi.arresting_body.id,
                    "name": poi.arresting_body.name,
                } if poi.arresting_body else None,
                "organisation": {
                    "id": poi.organisation.id,
                    "name": poi.organisation.org_name,
                } if poi.organisation else None,
                "addresses": address_data,
                "crime_count": crime_count,
                "arms_count": arms_count,
                "poi_status": {
                    "id": poi.poi_status.id,
                    "name": poi.poi_status.name,
                } if poi.poi_status else None,
                "age": calculate_poi_age(poi.dob) if poi.dob is not None else ''
            }

            response = {
                "status": "success",
                "status_code": 200,
                "poi_data": poi_data
            }

            # Audit logging for access event
            # audit_data = {
            #     "user_id": g.user["id"] if hasattr(g, "user") else None,
            #     "event": "get_poi",
            #     "auditable_id": poi.id,
            #     "url": request.url,
            #     "ip_address": request.remote_addr,
            #     "user_agent": request.user_agent.string,
            #     "created_at": current_time.isoformat(),
            #     "updated_at": current_time.isoformat(),
            # }

            # save_audit_data(audit_data)

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
                    # Generate a new filename using UUID
                    file_extension = os.path.splitext(file.filename)[1]  # Get the original file extension
                    new_filename = f"{uuid.uuid4()}{file_extension}"  # Generate a new filename

                    # Upload the new picture to MinIO
                    minio_file_url = upload_file_to_minio(os.getenv("MINIO_BUCKET_NAME"), file, new_filename)
                    if not minio_file_url:
                        return jsonify({"message": "Error uploading picture to MinIO"}), 500

                    # Save the new picture URL in the poi's picture field
                    poi.picture = minio_file_url
                else:
                    return jsonify({'message': 'Picture file type not allowed'}), 400

            # Update POI fields
            poi.update(
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
                marital_status=data.get('marital_status'),
                ref_numb=data.get('ref_numb'),
                dob=data.get('dob') or None,
                passport_number=data.get('passport_number'),
                other_id_number=data.get('other_id_number'),
                phone_number=data.get('phone_number'),
                email=data.get('email'),
                role=data.get('role'),
                affiliation=data.get('affiliation'),
                remark=data.get('remark'),
                middle_name=data.get('middle_name'),
                alias=data.get('alias'),
                category_id=data.get('category_id'),
                source_id=data.get('source_id'),
                country_id=data.get('country_id'),
                state_id=data.get('state_id'),
                gender_id=data.get('gender_id'),
                place_of_detention=data.get('place_of_detention'),
                arresting_body_id=data.get('arresting_body_id'),
                organisation_id=data.get('organisation_id'),
                website=data.get('website'),
                fb=data.get('fb'),
                instagram=data.get('instagram'),
                twitter=data.get('twitter'),
                telegram=data.get('telegram'),
                tiktok=data.get('tiktok'),
                status_id=data.get('status_id'),
                deleted_at=data.get('deleted_at')
            )

            # Update addresses
            address_types = ["work", "social", "residential"]
            for address_type in address_types:
                address_data = {
                    "address": data.get(f"{address_type}_address"),
                    "latitude": data.get(f"{address_type}_latitude"),
                    "longitude": data.get(f"{address_type}_longitude")
                }
                
                # Retrieve the existing address of the specific type
                existing_address = Address.query.filter_by(poi_id=poi_id, address_type=address_type).first()

                if existing_address:
                    # Update the existing address
                    existing_address.update(
                        address=address_data["address"],
                        latitude=address_data["latitude"],
                        longitude=address_data["longitude"]
                    )
                elif address_data["address"] or address_data["latitude"] or address_data["longitude"]:
                    # Create a new address if none exists for this type and there is valid input
                    new_address = Address(
                        poi_id=poi_id,
                        address_type=address_type,
                        address=address_data["address"],
                        latitude=address_data["latitude"],
                        longitude=address_data["longitude"]
                    )
                    db.session.add(new_address)

            db.session.commit()

            # Audit log
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
                    "remark": poi.remark,
                    "category_id": poi.category_id,
                    "source_id": poi.source_id,
                    "country_id": poi.country_id,
                    "state_id": poi.state_id,
                    "gender_id": poi.gender_id,
                    "place_of_detention": poi.place_of_detention,
                    "arresting_body_id": poi.arresting_body_id,
                    "organisation_id": poi.organisation_id,
                    "website": poi.website,
                    "fb": poi.fb,
                    "instagram": poi.instagram,
                    "twitter": poi.twitter,
                    "telegram": poi.telegram,
                    "tiktok": poi.tiktok,
                    "status_id": poi.status_id,
                    "deleted_at": poi.deleted_at,
                    "picture": poi.picture
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
                    "remark": poi.remark,
                    "category_id": poi.category_id,
                    "source_id": poi.source_id,
                    "country_id": poi.country_id,
                    "state_id": poi.state_id,
                    "gender_id": poi.gender_id,
                    "place_of_detention": poi.place_of_detention,
                    "arresting_body_id": poi.arresting_body_id,
                    "organisation_id": poi.organisation_id,
                    "website": poi.website,
                    "fb": poi.fb,
                    "instagram": poi.instagram,
                    "twitter": poi.twitter,
                    "telegram": poi.telegram,
                    "tiktok": poi.tiktok,
                    "status_id": poi.status_id,
                    "deleted_at": poi.deleted_at,
                    "picture": poi.picture
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

# List, Search and Filter POIs
@custom_jwt_required
def list_pois():
    # Get pagination and search term from request parameters
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    search_term = request.args.get('q', default=None, type=str)

    # Query base
    query = Poi.query.filter_by(deleted_at=None)

    # Filter by created_at
    date_added_start_date = request.args.get('from_date')
    date_added_end_date = request.args.get('to_date')

    if date_added_start_date and date_added_end_date:
        date_added_start_date = datetime.strptime(date_added_start_date, '%Y-%m-%d').date()
        date_added_end_date = datetime.strptime(date_added_end_date, '%Y-%m-%d').date()
        query = query.filter(Poi.created_at.between(date_added_start_date, date_added_end_date))
    elif date_added_start_date:
        date_added_start_date = datetime.strptime(date_added_start_date, '%Y-%m-%d').date()
        query = query.filter(Poi.created_at >= date_added_start_date)
    elif date_added_end_date:
        date_added_end_date = datetime.strptime(date_added_end_date, '%Y-%m-%d').date()
        query = query.filter(Poi.created_at <= date_added_end_date)

    # Filter by category
    category_id = request.args.get('category_id')
    if category_id:
        query = query.filter(Poi.category_id == category_id)

    # Filter by source
    source_id = request.args.get('source_id')
    if source_id:
        query = query.filter(Poi.source_id == source_id)

    # Filter by arresting body
    arresting_body_id = request.args.get('arrestingBody_id')
    if arresting_body_id:
        query = query.filter(Poi.arresting_body_id == arresting_body_id)
        
    
    # Filter by organisation
    organisation_id = request.args.get('organisation_id')
    if organisation_id:
        query = query.filter(Poi.organisation_id == organisation_id)

    # Filter by crimes committed
    crime_id = request.args.get('crime_id')
    if crime_id:
        query = query.join(Activity, Poi.id == Activity.poi_id) \
            .join(Crime, Activity.crime_id == Crime.id) \
            .filter(Crime.id == crime_id)

    # Filter by arms recovered
    arm_id = request.args.get('arm_id')
    if arm_id:
        query = query.join(ArmsRecovered, Poi.id == ArmsRecovered.poi_id) \
            .filter(ArmsRecovered.arm_id == arm_id)

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
        arms_count = len(poi.arms_recovered) if hasattr(poi, 'arms_recovered') else 0
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
                
        # List arms recovered
        arms_data = []
        if poi.arms_recovered:
            for arm in poi.arms_recovered:
                arms_data.append({
                    "id": arm.arm_id,
                    "name": arm.arm.name,  
                    "number_recovered": arm.number_recovered
                })

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
            "poi_status": {
                "id": poi.poi_status.id,
                "name": poi.poi_status.name,
            } if poi.poi_status else None,
            "crime_count": crime_count,
            "arms_count": arms_count,
            "arms_recovered": arms_data 
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