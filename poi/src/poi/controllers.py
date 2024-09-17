from flask import jsonify, request
from .models import Poi
from .. import db

# Create POI
def create_poi():
    data = request.json
    poi = Poi(
        ref_numb=data.get('ref_numb'),
        first_name=data['first_name'],
        middle_name=data.get('middle_name'),
        last_name=data['last_name'],
        alias=data.get('alias'),
        dob=data.get('dob'),
        passport_number=data.get('passport_number'),
        other_id_number=data.get('other_id_number'),
        phone_number=data.get('phone_number'),
        email=data.get('email'),
        role=data.get('role'),
        affiliation=data.get('affiliation'),
        address=data.get('address'),
        remark=data.get('remark'),
        category_id=data.get('category_id'),
        source_id=data.get('source_id'),
        country_id=data.get('country_id'),
        state_id=data.get('state_id'),
        gender_id=data.get('gender_id')
    )
    poi.save()
    return jsonify(poi.to_dict()), 201

# Get POI by ID
def get_poi(poi_id):
    poi = Poi.query.get(poi_id)
    if poi and not poi.deleted_at:
        return jsonify(poi.to_dict()), 200
    return jsonify({'message': 'POI not found'}), 404

# Update POI
def update_poi(poi_id):
    data = request.json
    poi = Poi.query.get(poi_id)
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
            category_id=data.get('category_id'),
            source_id=data.get('source_id'),
            country_id=data.get('country_id'),
            state_id=data.get('state_id'),
            gender_id=data.get('gender_id'),
            deleted_at=data.get('deleted_at')
        )
        return jsonify(poi.to_dict()), 200
    return jsonify({'message': 'POI not found'}), 404

# Soft Delete POI
def delete_poi(poi_id):
    poi = Poi.query.get(poi_id)
    if poi:
        poi.soft_delete()
        db.session.commit()
        return jsonify({'message': 'POI deleted successfully'}), 200
    return jsonify({'message': 'POI not found'}), 404

# Restore Soft-Deleted POI
def restore_poi(poi_id):
    poi = Poi.query.filter(Poi.id == poi_id, Poi.deleted_at != None).first()
    if poi:
        poi.restore()
        db.session.commit()
        return jsonify(poi.to_dict()), 200
    return jsonify({'message': 'POI not found or not deleted'}), 404

# List all POIs
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
            (Poi.dob.ilike(search)) |  # You might need to format `dob` as a string in the actual database if it's a Date field
            (Poi.passport_number.ilike(search)) |
            (Poi.other_id_number.ilike(search)) |
            (Poi.phone_number.ilike(search)) |
            (Poi.email.ilike(search)) |
            (Poi.role.ilike(search)) |
            (Poi.affiliation.ilike(search)) |
            (Poi.address.ilike(search)) |
            (Poi.remark.ilike(search))
        )

    # Pagination
    paginated_pois = query.paginate(page=page, per_page=per_page, error_out=False)

    # Format response
    pois_list = [poi.to_dict() for poi in paginated_pois.items]
    return jsonify({
        'total': paginated_pois.total,
        'pages': paginated_pois.pages,
        'current_page': paginated_pois.page,
        'pois': pois_list
    })
