from flask import request, jsonify
from .models import Organisation, db

# Create Organisation
def create_organisation():
    data = request.get_json()
    new_org = Organisation(
        ref_numb=data.get('ref_numb'),
        reg_numb=data.get('reg_numb'),
        date_of_registration=data.get('date_of_registration'),
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
        category_id=data.get('category_id'),
        source_id=data.get('source_id'),
        remark=data.get('remark')
    )

    db.session.add(new_org)
    db.session.commit()

    return jsonify({"message": "Organisation added successfully!", "organisation": new_org.to_dict()}), 201

# Get all Organisations
def get_organisations():
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    search_term = request.args.get('q', default=None, type=str)

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
    org_list = [org.to_dict() for org in paginated_org.items]
    return jsonify({
        'total': paginated_org.total,
        'pages': paginated_org.pages,
        'current_page': paginated_org.page,
        'orgs': org_list
    })

# Get a single Organisation by ID
def get_organisation(id):
    organisation = Organisation.query.get_or_404(id)
    return jsonify(organisation.to_dict()), 200

# Update Organisation
def update_organisation(id):
    data = request.get_json()
    organisation = Organisation.query.get_or_404(id)

    organisation.update(
        ref_numb=data.get('ref_numb'),
        reg_numb=data.get('reg_numb'),
        date_of_registration=data.get('date_of_registration'),
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
        category_id=data.get('category_id'),
        source_id=data.get('source_id'),
        remark=data.get('remark')
    )

    db.session.commit()

    return jsonify({"message": "Organisation updated successfully!", "organisation": organisation.to_dict()}), 200

# Delete Organisation
def delete_organisation(id):
    organisation = Organisation.query.get_or_404(id)
    db.session.delete(organisation)
    db.session.commit()

    return jsonify({"message": "Organisation deleted successfully!"}), 200