from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_

from .. import db
from .models import Implication
from ..redis_manager import custom_jwt_required
def seed_data():
    try:
        Implication.create_seed_data()
        db.session.commit()
        return jsonify({'message': 'Implication Data seeded successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error seeding data', 'error': str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def list_implications():
    try:
        # Get query parameters for pagination
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)

        typ = request.args.get('type', default=None, type=int)
        implication_query = Implication.query.filter_by(deleted_at=None)

        if typ is not None:
            implication_query = implication_query.filter(Implication.type == typ)

        implication_paginated = implication_query.paginate(
            page=page, per_page=per_page
        )

        implication_list = []
        for implication in implication_paginated.items:
            implication_data = implication.to_dict()
            implication_list.append(implication_data)

        response = {
            "status": "success",
            "status_code": 200,
            "implications": implication_list,
            "total_pages": implication_paginated.pages,
            "current_page": implication_paginated.page,
            "total_items": implication_paginated.total,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of implications: {str(e)}",
        }

    return jsonify(response), response["status_code"]