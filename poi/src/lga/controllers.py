from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_

from .. import db
from .models import Lga
from ..redis_manager import custom_jwt_required

def get_lgas_by_state(state_id):
    try:
        lgas = Lga.query.filter_by(state_id=state_id).all()

        lga_list = []

        for lga in lgas:
            lga_list.append(lga.to_dict())

        response = {
            "status": "success",
            "status_code": 200,
            "lgas": lga_list,
        }
    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of lgas: {str(e)}",
        }

    return jsonify(response), response["status_code"]

@custom_jwt_required
def get_lgas():
    try:
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        search_term = request.args.get('q', default=None, type=str)

        Lga_query = Lga.query

        if search_term:
            search_pattern = f"%{search_term}%"
            Lga_query = Lga_query.filter(
                or_(
                    Lga.name.ilike(search_pattern),
                    Lga.description.ilike(search_pattern)
                )
            )

        Lgas = Lga_query.paginate(page=page, per_page=per_page)

        lga_list = []

        for lga in Lgas:
            lga_data = lga.to_dict()
            lga_list.append(lga_data)

        response = {
            "status": "success",
            "status_code": 200,
            "lgas": lga_list,
            "total_pages": Lgas.pages,
            "current_page": Lgas.page,
            "total_items": Lgas.total,
        }

    except SQLAlchemyError as e:
        response = {
            "status": "error",
            "status_code": 500,
            "message": f"An error occurred while retrieving the list of lgas: {str(e)}",
        }

    return jsonify(response), response["status_code"]