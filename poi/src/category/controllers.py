from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import Category
from ..util import custom_jwt_required, save_audit_data

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def get_categories():
    try:
        # Extract pagination parameters from the request
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)

        # Extract search term from the request
        search_term = request.args.get('q', default=None, type=str)

        # Query the database, applying search and ordering by name
        query = Category.query.order_by(Category.name.asc())

        # Apply search if search term is provided
        if search_term:
            search = f"%{search_term}%"
            query = query.filter(Category.name.ilike(search))

        # Paginate the query
        paginated_categories = query.paginate(page=page, per_page=per_page, error_out=False)

        # Prepare the list of categories to return
        category_list = []
        for category in paginated_categories.items:
            category_data = category.to_dict()
            category_list.append(category_data)

        # Return the paginated and filtered categories with status success
        return jsonify({
            "status": "success",
            "status_code": 200,
            "categories": category_list,
            "pagination": {
                "total": paginated_categories.total,
                "pages": paginated_categories.pages,
                "current_page": paginated_categories.page,
                "per_page": paginated_categories.per_page,
                "next_page": paginated_categories.next_num if paginated_categories.has_next else None,
                "prev_page": paginated_categories.prev_num if paginated_categories.has_prev else None
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@custom_jwt_required
def add_category():
    if request.method == "POST":
        data = request.get_json()
        category_name = data.get("name")
        description = data.get("description")

        if not category_name:
            return jsonify({"message": "Name is required"}), 400

        new_category = Category(
            name=category_name,
            description=description
        )

        try:
            db.session.add(new_category)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_category",
                "auditable_id": new_category.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "category_name": category_name,
                        "description": description
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Category, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Category added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding category", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
def get_category(category_id):
    category = Category.query.filter_by(id=category_id, deleted_at=None).first()
    if category:
        category_data = {
            "id": category.id,
            "name": category.name,
            "description": category.description
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_category",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Auth, Category, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"category": category_data})
    else:
        return jsonify({"message": "Category not found", "category": []}), 404


@custom_jwt_required
def edit_category(category_id):
    category = Category.query.filter_by(id=category_id).first()

    if category is None:
        return jsonify({"message": "Category not found", "category": []}), 200

    data = request.get_json()
    category_name = data.get("name")
    description = data.get("description")

    if not category_name:
        return jsonify({"message": "Name is required"}), 400

    category.name = category_name
    category.description = description

    try:
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"edit_category",
                "auditable_id": category.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "category_name": category_name,
                        "description": description
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Category, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Category updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating category", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def delete_category(category_id):
    category = Category.query.filter_by(id=category_id, deleted_at=None).first()

    if category is None:
        return jsonify({"message": "Category not found", "category": []}), 200

    try:
        category.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"delete_category",
                "auditable_id": category.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "category_name": category.name,
                        "description": category.description
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Category, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Category deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting category", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
def restore_category(category_id):
    category = Category.query.filter_by(id=category_id).first()

    if category is None:
        return jsonify({"message": "Category not found", "category": []}), 200

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_category",
            "auditable_id": category.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": category.name,
                    "description": category.description
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Setup, Category, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        category.restore()
        db.session.commit()
        return (
            jsonify({"message": "Category restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring category", "error": str(e)}), 500
    finally:
        db.session.close()