from flask import jsonify, request, json, g

from .. import db
from .models import RolePermission
from ..modules.models import Module
from ..permissions.models import Permission
from ..roles.models import Role
from ..redis_manager import  custom_jwt_required
from ..rabbitmq_manager import publish_to_rabbitmq
from datetime import datetime

@custom_jwt_required
def get_role_permissions():
    roles_permission = RolePermission.query.all()
    role_list = []

    for role in roles_permission:
        role_data = {
            'id': role.id,
            'role_id': role.role_id,
            'module_id': role.module_id,
            'permission_id': role.permission_id
        }
        role_list.append(role_data)

    return jsonify({'roles_permissions': role_list})

@custom_jwt_required
def add_role_premission(role_id):
    if request.method == 'POST':
        data = request.get_json()
        permissions = data.get('permissions')

        if len(permissions) == 0:
            return jsonify({'message': 'You did not select any permissions'}), 404
        
        role = Role.query.filter_by(id=role_id, deleted_at=None).first()

        if role is None:
            return jsonify({'message': 'Role not found'}), 404

        objects = []
        for item in permissions:
            module_id = item['module_id']
            permission_id = item['permission_id']

            module = Module.query.filter_by(id=module_id, deleted_at=None).first()
            if module is None:
                return jsonify({'message': 'Module not found'}), 404

            permission = Permission.query.filter_by(id=permission_id, deleted_at=None).first()

            if permission is None:
                return jsonify({'message': 'Permission not found'}), 404
        
            new_object = RolePermission(role_id=role_id, module_id=module_id, permission_id=permission_id)
            objects.append(new_object)

        # delete all permissions then add new permissions
        RolePermission.query.filter_by(role_id=role_id).delete()
        db.session.commit()

        try:
            db.session.add_all(objects)
            db.session.commit()
            
            current_time = datetime.utcnow()
            audit_data = {
                "user_id": g.user["id"] if hasattr(g, "user") else None,
                "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
                "user_email": g.user["id"] if hasattr(g, "user") else None,
                "event": "add_permission",
                "auditable_id": new_object.id,
                "old_values": None,
                "new_values": json.dumps(
                    permissions
                ),
                "url": request.url,
                "ip_address": request.remote_addr,
                "user_agent": request.user_agent.string,
                "tags": "Auth, Role, Create",
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat(),
            }

            serialized_data = json.dumps(audit_data)
            publish_to_rabbitmq(serialized_data)
            
            return jsonify({'message': 'Role permissions assigned added successfully'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error adding role permission', 'error': str(e)}), 500
        finally:
            db.session.close()

@custom_jwt_required
def get_role_permission_by_module(role_id, module_id):
    response = {}  # Initialize the response dictionary

    role = Role.query.filter_by(id=role_id, deleted_at=None).first()

    if role is None:
        return jsonify({'message': 'Role not found'}), 404

    module = Module.query.filter_by(id=module_id, deleted_at=None).first()

    if role is None:
        return jsonify({'message': 'Role not found'}), 404

    if module is None:
        return jsonify({'message': 'Module not found'}), 404

    rolePermissions = RolePermission.query.filter_by(role_id=role_id, module_id=module_id).all()

    permission_list = []

    for rolePermission in rolePermissions:
        permisModelData = Permission.query.get(rolePermission.permission_id)
        moduleModelData = Module.query.get(rolePermission.module_id)

        rolePermissions = RolePermission.query.filter_by(role_id=role_id, module_id=rolePermission.module_id).all()

        module_data = {
            'id': moduleModelData.id,
            'name': moduleModelData.name,
            'description': moduleModelData.description
        }

        permission_data = {
            'id': permisModelData.id,
            'name': permisModelData.name,
            'description': permisModelData.description
        }

        response = {
            'module': module_data,
            'permission': permission_data
        }
        permission_list.append(response)
    return get_grouped_module_permissions(permission_list, role), 200

@custom_jwt_required
def get_role_permission(role_id):
    response = {}  # Initialize the response dictionary
    permission_list = []
    role = Role.query.filter_by(id=role_id, deleted_at=None).first()

    if role is None:
        return jsonify({'message': 'Role not found'}), 404

    rolePermissions = RolePermission.query.filter_by(role_id=role_id).all()

    for rolePermission in rolePermissions:
        permisModelData = Permission.query.filter_by(id=rolePermission.permission_id, deleted_at=None).first()
        moduleModelData = Module.query.filter_by(id=rolePermission.module_id, deleted_at=None).first()

        if permisModelData is not None and moduleModelData is not None:
            module_data = {
                'id': moduleModelData.id,
                'name': moduleModelData.name,
                'description': moduleModelData.description
            }

            permission_data = {
                'id': permisModelData.id,
                'name': permisModelData.name,
                'description': permisModelData.description
            }

            response = {
                'module': module_data,
                'permission': permission_data
            }

            permission_list.append(response)

    #group sort the modules and permissions by modules
    return get_grouped_modules_permissions(permission_list, role), 200


def get_grouped_modules_permissions(listdata, role):
    result_dict = {}
    permission_list = []

    role = {
        "role_id": role.id,
        "role_name": role.name,
    }

    for item in listdata:
        module_id = item["module"]["id"]
        module_name = item["module"]["name"]
        permission = {
            "description": item["permission"]["description"],
            "id": item["permission"]["id"],
            "name": item["permission"]["name"]
        }

        if module_id not in result_dict:
            result_dict[module_id] = {
                "module_id": module_id,
                "module_name": module_name,
                "permissions": [permission]
            }
        else:
            result_dict[module_id]["permissions"].append(permission)

    response = {
        'role': role,
        'modules': result_dict
    }

    permission_list.append(response)

    # Convert the dictionary values into a list
    result_list = list(result_dict.values())

    return result_list


def get_grouped_module_permissions(data, role):
    grouped_data = {}

    for entry in data:
        module = entry["module"]
        permission = entry["permission"]

        role_id = role.id
        role_name = role.name

        module_id = module["id"]
        module_name = module["name"]

        if module_id not in grouped_data:
            grouped_data[module_id] = {
                "role_id": role_id,
                "role_name": role_name,
                "module_id": module_id,
                "module_name": module_name,
                "permissions": []
            }

        grouped_data[module_id]["permissions"].append(permission)

    return jsonify(list(grouped_data.values()))

@custom_jwt_required
def delete_role_permission_by_module(role_id, module_id, permission_id):
    module = Module.query.filter_by(id=role_id, deleted_at=None).first()
    role = Role.query.filter_by(id=module_id, deleted_at=None).first()
    permission = Permission.query.filter_by(id=permission_id, deleted_at=None).first()

    if permission is None:
        return jsonify({'message': 'Permission not found'}), 404

    if module is None:
        return jsonify({'message': 'Module not found'}), 404

    if role is None:
        return jsonify({'message': 'Role not found'}), 404

    rolePermissions = RolePermission.query.filter_by(role_id=role_id, module_id=module_id,
                                                     permission_id=permission_id).all()

    if rolePermissions is None:
        return jsonify({'message': 'Role permission not found'}), 404

    for role in rolePermissions:
        try:
            db.session.delete(role)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error deleting role permissions', 'error': str(e)}), 500
        finally:
            db.session.close()

        current_time = datetime.utcnow()
        audit_data = {
            "user_id": g.user["id"] if hasattr(g, "user") else None,
           "employee_id": g.user["employee_id"] if hasattr(g, "employee") else None,
            "user_email": g.user["id"] if hasattr(g, "user") else None,
            "event": "delete_permission",
            "auditable_id": rolePermissions.id,
            "old_values": json.dumps(
                rolePermissions
            ),
            "new_values": None,
            "url": request.url,
            "ip_address": request.remote_addr,
            "user_agent": request.user_agent.string,
            "tags": "Auth, Role, Permission, Delete",
            "created_at": current_time.isoformat(),
            "updated_at": current_time.isoformat(),
        }

        serialized_data = json.dumps(audit_data)
        publish_to_rabbitmq(serialized_data)
        
    return jsonify({'message': 'Role permission deleted successfully'}), 200


