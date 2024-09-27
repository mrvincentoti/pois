from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import Affiliation
from ..util import custom_jwt_required, save_audit_data

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def get_affiliations():
    try:
        # Extract pagination parameters from the request
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)
        
        # Extract search term from the request
        search_term = request.args.get('q', default=None, type=str)

        # Query the database, applying search and ordering by name
        query = Affiliation.query.filter_by(deleted_at=None).order_by(Affiliation.name.asc())

        # Apply search if search term is provided
        if search_term:
            search = f"%{search_term}%"
            query = query.filter(Affiliation.name.ilike(search))
        
        # Paginate the query
        paginated_affiliations = query.paginate(page=page, per_page=per_page, error_out=False)

        # Prepare the list of affiliations to return
        affiliation_list = []
        for affiliation in paginated_affiliations.items:
            affiliation_data = affiliation.to_dict()
            affiliation_list.append(affiliation_data)

        # Return the paginated and filtered affiliations with status success
        return jsonify({
            "status": "success",
            "status_code": 200,
            "affiliations": affiliation_list,
            "pagination": {
                "total": paginated_affiliations.total,
                "pages": paginated_affiliations.pages,
                "current_page": paginated_affiliations.page,
                "per_page": paginated_affiliations.per_page,
                "next_page": paginated_affiliations.next_num if paginated_affiliations.has_next else None,
                "prev_page": paginated_affiliations.prev_num if paginated_affiliations.has_prev else None
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@custom_jwt_required
def add_affiliation():
    if request.method == "POST":
        data = request.get_json()
        affiliation_name = data.get("name")

        if not affiliation_name:
            return jsonify({"message": "Name is required"}), 400

        new_affiliation = Affiliation(
            name=affiliation_name
        )

        try:
            db.session.add(new_affiliation)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_affiliation",
                "auditable_id": new_affiliation.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "affiliation_name": affiliation_name
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Affiliation, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Affiliation added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding affiliation", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_affiliation(affiliation_id):
    affiliation = Affiliation.query.filter_by(id=affiliation_id, deleted_at=None).first()
    if affiliation:
        affiliation_data = {
            "id": affiliation.id,
            "name": affiliation.name
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_affiliation",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Auth, Affiliation, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"affiliation": affiliation_data})
    else:
        return jsonify({"message": "Affiliation not found", "affiliation": []}), 200


@custom_jwt_required
def edit_affiliation(affiliation_id):
    affiliation = Affiliation.query.filter_by(id=affiliation_id, deleted_at=None).first()

    if affiliation is None:
        return jsonify({"message": "Affiliation not found", "affiliation": []}), 200

    data = request.get_json()
    affiliation_name = data.get("name")

    if not affiliation_name:
        return jsonify({"message": "Name is required"}), 400

    affiliation.name = affiliation_name

    try:
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"edit_affiliation",
                "auditable_id": affiliation.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "affiliation_name": affiliation_name
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Affiliation, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Affiliation updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating affiliation", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_affiliation(affiliation_id):
    affiliation = Affiliation.query.filter_by(id=affiliation_id, deleted_at=None).first()

    if affiliation is None:
        return jsonify({"message": "Affiliation not found", "affiliation": []}), 200

    try:
        affiliation.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"delete_affiliation",
                "auditable_id": affiliation.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "affiliation_name": affiliation.name,
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Affiliation, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Affiliation deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting affiliation", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_affiliation(affiliation_id):
    affiliation = Affiliation.query.filter_by(id=affiliation_id).first()

    if affiliation is None:
        return jsonify({"message": "Affiliation not found", "affiliation": []}), 200

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_affiliation",
            "auditable_id": affiliation.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": affiliation.name,
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Setup, Affiliation, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        affiliation.restore()
        db.session.commit()
        return (
            jsonify({"message": "Affiliation restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring affiliation", "error": str(e)}), 500
    finally:
        db.session.close()