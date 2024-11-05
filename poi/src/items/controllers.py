from flask import request, jsonify,json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from .models import Item
from ..util import custom_jwt_required, save_audit_data, permission_required

def slugify(text):
    return text.replace(' ', '-').lower()

@custom_jwt_required
def list_items():
    query = Item.query
    try:
        # Sort and paginate the results
        query = query.order_by(Item.name.asc()).all()

        # Format response
        items_list = []
        for item in query:
            # Fetch only the required attributes
            items_data = {
                'id': item.id,            
                'name': item.name
            }
            items_list.append(items_data)

        response = {
            'items': items_list,
            'status': 'success',
            'status_code': 200
        }

    except Exception as e:
        db.session.rollback()
        response = {
            'status': 'error',
            'status_code': 500,
            'message': f"An error occurred while fetching the items: {str(e)}"
        }

    return jsonify(response), response.get('status_code', 500)
    

@custom_jwt_required
@permission_required
def get_items():
    try:
        # Extract pagination parameters from the request
        page = request.args.get('page', default=1, type=int)
        per_page = request.args.get('per_page', default=10, type=int)

        # Extract search term from the request
        search_term = request.args.get('q', default=None, type=str)

        # Query the database, applying search and ordering by name
        query = Item.query.order_by(Item.name.asc())

        # Apply search if search term is provided
        if search_term:
            search = f"%{search_term}%"
            query = query.filter(Item.name.ilike(search))

        # Paginate the query
        paginated_items = query.paginate(page=page, per_page=per_page, error_out=False)

        # Prepare the list of items to return
        item_list = []
        for item in paginated_items.items:
            item_data = item.to_dict()
            item_list.append(item_data)

        # Return the paginated and filtered items with status success
        return jsonify({
            "status": "success",
            "status_code": 200,
            "items": item_list,
            "pagination": {
                "total": paginated_items.total,
                "pages": paginated_items.pages,
                "current_page": paginated_items.page,
                "per_page": paginated_items.per_page,
                "next_page": paginated_items.next_num if paginated_items.has_next else None,
                "prev_page": paginated_items.prev_num if paginated_items.has_prev else None
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@custom_jwt_required
@permission_required
def add_item():
    if request.method == "POST":
        data = request.get_json()
        item_name = data.get("name")
        description = data.get("description")

        if not item_name:
            return jsonify({"message": "Name is required"}), 400

        new_item = Item(
            name=item_name,
            description=description
        )

        try:
            db.session.add(new_item)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"add_item",
                "auditable_id": new_item.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "item_name": item_name,
                        "description": description
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Item, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            save_audit_data(audit_data)
            
            return jsonify({"message": "Item added successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error adding item", "error": str(e)}), 500
        finally:
            db.session.close()


@custom_jwt_required
@permission_required
def get_item(item_id):
    item = Item.query.filter_by(id=item_id, deleted_at=None).first()
    if item:
        item_data = {
            "id": item.id,
            "name": item.name,
            "description": item.description
        }

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "get_item",
            "auditable_id": None,
            "old_values": None,
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Setup, Item, Get",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        return jsonify({"item": item_data})
    else:
        return jsonify({"message": "Item not found"}), 404


@custom_jwt_required
@permission_required
def edit_item(item_id):
    item = Item.query.filter_by(id=item_id).first()

    if item is None:
        return jsonify({"message": "Item not found"}), 404

    data = request.get_json()
    item_name = data.get("name")
    description = data.get("description")

    if not item_name:
        return jsonify({"message": "Name is required"}), 400

    item.name = item_name
    item.description = description

    try:
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"edit_item",
                "auditable_id": item.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "item_name": item_name,
                        "description": description
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Item, Update",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Item updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating item", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
@permission_required
def delete_item(item_id):
    item = Item.query.filter_by(id=item_id, deleted_at=None).first()

    if item is None:
        return jsonify({"message": "Item not found"}), 404

    try:
        item.soft_delete()
        db.session.commit()
        
        current_time = datetime.utcnow()
        audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "first_name": g.user["first_name"] if hasattr(g, "user") else None,
                "last_name": g.user["last_name"] if hasattr(g, "user") else None,
                "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
                "user_email": g.user["email"] if hasattr(g, "user") else None,
                "event":"delete_item",
                "auditable_id": item.id,
                "old_values": None,
                "new_values": json.dumps(
                    {
                        "item_name": item.name,
                        "description": item.description
                    }
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Item, Delete",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)
        
        return jsonify({"message": "Item deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting item", "error": str(e)}), 500
    finally:
        db.session.close()


@custom_jwt_required
@permission_required
def restore_item(item_id):
    item = Item.query.filter_by(id=item_id).first()

    if item is None:
        return jsonify({"message": "Item not found"}), 404

    try:
        # Audit - Record before restoration
        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
            "first_name": g.user["first_name"] if hasattr(g, "user") else None,
            "last_name": g.user["last_name"] if hasattr(g, "user") else None,
            "pfs_num": g.user["pfs_num"] if hasattr(g, "user") else None,
            "user_email": g.user["email"] if hasattr(g, "user") else None,
            "event": "restore_item",
            "auditable_id": item.id,
            "old_values": None,
            "new_values": json.dumps(
                {
                    "name": item.name,
                    "description": item.description
                }
            ),
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Item, Restore",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        save_audit_data(audit_data)

        item.restore()
        db.session.commit()
        return (
            jsonify({"message": "Item restored successfully"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error restoring item", "error": str(e)}), 500
    finally:
        db.session.close()