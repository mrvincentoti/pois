from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import Crime
from ..util import custom_jwt_required, save_audit_data, permission_required

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def list_crimes():
    query = Crime.query
    try:
        # Sort and paginate the results
        query = query.order_by(Crime.name.asc()).all()

        # Format response
        crimes_list = []
        for crime in query:
            # Fetch only the required attributes
            crimes_data = {
                'id': crime.id,            
                'name': crime.name
            }
            crimes_list.append(crimes_data)

        response = {
            'crimes': crimes_list,
            'status': 'success',
            'status_code': 200
        }

    except Exception as e:
        db.session.rollback()
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred while fetching the crimes: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)
    
    
@custom_jwt_required
@permission_required
def get_crimes():
    try:
        # Extract pagination parameters from the request
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)

        # Extract search term from the request
        search_term = request.args.get('q', default=None, type=str)

        # Query the database, applying search and ordering by name
        query = Crime.query.order_by(Crime.name.asc())

        # Apply search if search term is provided
        if search_term:
            search = f"%{search_term}%"
            query = query.filter(Crime.name.ilike(search))

        # Paginate the query
        paginated_crimes = query.paginate(page=page, per_page=per_page, error_out=False)

        # Prepare the list of crimes to return
        crime_list = []
        for crime in paginated_crimes.items:
            crime_data = crime.to_dict()
            crime_list.append(crime_data)

        # Return the paginated and filtered crimes with status success
        return jsonify({
            "status": "success",
            "status_code": 200,
            "crimes": crime_list,
            "pagination": {
                "total": paginated_crimes.total,
                "pages": paginated_crimes.pages,
                "current_page": paginated_crimes.page,
                "per_page": paginated_crimes.per_page,
                "next_page": paginated_crimes.next_num if paginated_crimes.has_next else None,
                "prev_page": paginated_crimes.prev_num if paginated_crimes.has_prev else None
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@custom_jwt_required
@permission_required
def add_crime():
    if request.method == "POST":
        data = request.get_json()
        crime_name = data.get("name")
        description = data.get("description")

        if not crime_name:
            return jsonify({"message": "Name is required"}), 400

        new_crime = Crime(
            name=crime_name,
            description=description
        )

        try:
            db.session.add(new_crime)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_crime",
                "auditable_id": new_crime.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "crime_name": crime_name,
                        "description": description
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Crime, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Crime added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding crime", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
@permission_required
def get_crime(crime_id):
    crime = Crime.query.filter_by(id=crime_id, deleted_at=None).first()
    if crime:
        crime_data = {
            "id": crime.id,
            "name": crime.name,
            "description": crime.description
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_crime",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Crime, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"crime": crime_data})
    else:
        return jsonify({"message": "Crime not found"}), 404


@custom_jwt_required
@permission_required
def edit_crime(crime_id):
    crime = Crime.query.filter_by(id=crime_id).first()

    if crime is None:
        return jsonify({"message": "Crime not found"}), 404

    data = request.get_json()
    crime_name = data.get("name")
    description = data.get("description")

    if not crime_name:
        return jsonify({"message": "Name is required"}), 400

    crime.name = crime_name
    crime.description = description

    try:
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"edit_crime",
                "auditable_id": crime.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "crime_name": crime_name,
                        "description": description
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Crime, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Crime updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating crime", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
@permission_required
def delete_crime(crime_id):
    crime = Crime.query.filter_by(id=crime_id, deleted_at=None).first()

    if crime is None:
        return jsonify({"message": "Crime not found"}), 404

    try:
        crime.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"delete_crime",
                "auditable_id": crime.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "crime_name": crime.name,
                        "description": crime.description
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Crime, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Crime deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting crime", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
@permission_required
def restore_crime(crime_id):
    crime = Crime.query.filter_by(id=crime_id).first()

    if crime is None:
        return jsonify({"message": "Crime not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_crime",
            "auditable_id": crime.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": crime.name,
                    "description": crime.description
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Crime, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        crime.restore()
        db.session.commit()
        return (
            jsonify({"message": "Crime restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring crime", "error": str(e)}), 500
    finally:
        db.session.close()