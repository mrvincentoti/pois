from flask import jsonify, request, g, json
from datetime import datetime as dt
from datetime import datetime
from .models import Poi
from .. import db
from ..util import save_audit_data, custom_jwt_required

# Create POI
@custom_jwt_required
def create_poi():
    data = request.json
    ref_numb = data.get('ref_numb')
    picture = data.get('picture')
    first_name = data.get('first_name')
    middle_name = data.get('middle_name')
    last_name = data['last_name']
    alias = data.get('alias')
    dob = data.get('dob')
    passport_number = data.get('passport_number')
    other_id_number = data.get('other_id_number')
    phone_number = data.get('phone_number')
    email = data.get('email')
    role = data.get('role')
    affiliation_id = data.get('affiliation_id')
    address = data.get('address')
    remark = data.get('remark')
    category_id = data.get('category_id')
    source_id = data.get('source_id')
    country_id = data.get('country_id')
    state_id = data.get('state_id')
    gender_id = data.get('gender_id')
    crime_committed = data.get('crime_committed')
    crime_date = data.get('crime_date')
    casualties_recorded = data.get('casualties_recorded')
    arresting_body = data.get('arresting_body')
    place_of_detention = data.get('place_of_detention')
    action_taken = data.get('action_taken')

    response = {}
    try:
        # Create POI instance
        poi = Poi(
            ref_numb=ref_numb,
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            alias=alias,
            picture=picture,
            dob=dob,
            passport_number=passport_number,
            other_id_number=other_id_number,
            phone_number=phone_number,
            email=email,
            role=role,
            affiliation_id=affiliation_id,
            address=address,
            remark=remark,
            crime_committed=crime_committed,
            crime_date=crime_date,
            casualties_recorded=casualties_recorded,
            arresting_body=arresting_body,
            place_of_detention=place_of_detention,
            action_taken=action_taken,
            category_id=category_id,
            source_id=source_id,
            country_id=country_id,
            state_id=state_id,
            gender_id=gender_id
        )

        db.session.add(poi)
        db.session.commit()

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
                "alias": poi.alias,
                "dob": poi.dob,
                "passport_number": poi.passport_number,
                "other_id_number": poi.other_id_number,
                "phone_number": poi.phone_number,
                "email": poi.email,
                "role": poi.role,
                "affiliation_id": poi.affiliation_id,
                "crime_committed": poi.crime_committed,
                "crime_date": poi.crime_date,
                "casualties_recorded": poi.casualties_recorded,
                "arresting_body": poi.arresting_body,
                "place_of_detention": poi.place_of_detention,
                "action_taken": poi.action_taken,
                "address": poi.address,
                "remark": poi.remark,
                "category_id": poi.category_id,
                "source_id": poi.source_id,
                "country_id": poi.country_id,
                "state_id": poi.state_id,
                "gender_id": poi.gender_id,
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
        response["message"] = f"An error occurred while creating the poi: {str(e)}"

    return jsonify(response), response["status_code"]

# Get POI by ID
@custom_jwt_required
def get_poi(poi_id):
    try:
        poi = Poi.query.get(poi_id)
        if poi and not poi.deleted_at:
            poi_data = {
                "ref_numb": poi.ref_numb,
                "first_name": poi.first_name,
                "middle_name": poi.middle_name,
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
            }

            response = {
                "status": "success",
                "status_code": 200,
                "user_data": poi_data
            }
        else:
            response = {
                "status": "error",
                "status_code": 404,
                "message": "Poi not found",
            }
    except Exception as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": "An error occurred while retrieving the poi.",
        }

    return jsonify(response), response["status_code"]

# Update POI
@custom_jwt_required
def update_poi(poi_id):
    data = request.json
    poi = Poi.query.get(poi_id)

    try:
        response = {}
        if poi:
            poi.update(
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
                ref_numb=data.get('ref_numb'),
                dob=data.get('dob'),
                passport_number=data.get('passport_number'),
                other_id_number=data.get('other_id_number'),
                phone_number=data.get('phone_number'),
                email=data.get('email'),
                role=data.get('role'),
                affiliation=data.get('affiliation'),
                address=data.get('address'),
                remark=data.get('remark'),
                middle_name=data.get('middle_name'),
                alias=data.get('alias'),
                picture=data.get('picture'),
                crime_committed=data.get('crime_committed'),
                crime_date=data.get('crime_date'),
                casualties_recorded=data.get('casualties_recorded'),
                arresting_body=data.get('arresting_body'),
                place_of_detention=data.get('place_of_detention'),
                action_taken=data.get('action_taken'),
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
                "old_values": None,
                "new_values": json.dumps({
                    "ref_numb": poi.ref_numb,
                    "first_name": poi.first_name,
                    "middle_name": poi.middle_name,
                    "last_name": poi.last_name,
                    "alias": poi.alias,
                    "dob": poi.dob,
                    "passport_number": poi.passport_number,
                    "other_id_number": poi.other_id_number,
                    "phone_number": poi.phone_number,
                    "email": poi.email,
                    "role": poi.role,
                    "affiliation_id": poi.affiliation_id,
                    "crime_committed": poi.crime_committed,
                    "crime_date": poi.crime_date,
                    "casualties_recorded": poi.casualties_recorded,
                    "arresting_body": poi.arresting_body,
                    "place_of_detention": poi.place_of_detention,
                    "action_taken": poi.action_taken,
                    "address": poi.address,
                    "remark": poi.remark,
                    "category_id": poi.category_id,
                    "source_id": poi.source_id,
                    "country_id": poi.country_id,
                    "state_id": poi.state_id,
                    "gender_id": poi.gender_id,
                    "deleted_at": poi.deleted_at, 
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
            response["status_code"] = 201
            response["message"] = "POI updated successfully"
    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        response["status"] = "error"
        response["status_code"] = 500
        response["message"] = f"An error occurred while update the poi: {str(e)}"

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

# List all POIs
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
            (Poi.remark.ilike(search)) |
            (Poi.crime_committed.ilike(search)) |
            (Poi.casualties_recorded.ilike(search)) |
            (Poi.arresting_body.ilike(search)) |
            (Poi.place_of_detention.ilike(search)) |
            (Poi.action_taken.ilike(search))
        )

    # Pagination
    paginated_pois = query.paginate(page=page, per_page=per_page, error_out=False)

    # Format response
    pois_list = [poi.to_dict() for poi in paginated_pois.items]

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
