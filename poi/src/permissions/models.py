from sqlalchemy import inspect
from datetime import datetime
import json

from .. import db # from __init__.py
from ..roles.models import Role
from ..rolePermissions.models import RolePermission


class Permission(db.Model):
    __tablename__ = 'permissions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    group = db.Column(db.Text)
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"), nullable=True)
    route_path = db.Column(db.Text, nullable=True)
    method = db.Column(db.Text, nullable=True)
    deleted_at = db.Column(db.DateTime, nullable=True)

    module = db.relationship('Module', backref='permissions')
    roles = db.relationship('Role', secondary='role_permissions', back_populates='permissions')

    def __init__(self, name, description, group, module_id, route_path, method):
        self.name = name
        self.description = description
        self.group = group
        self.module_id = module_id
        self.route_path = route_path
        self.method = method

    def __repr__(self):
        return f'<Permission {self.name}>'

    def soft_delete(self):
        self.deleted_at = datetime.now()
   
    def restore(self):
        self.deleted_at = None

    @classmethod
    def create_seed_data(cls, path):
        # Sample data for modules
        modules_data = []

        try:
            with open(path, 'r') as file:
                modules_data = json.load(file)

            # Loop through the sample data and add to the database
            for permission_data in modules_data:
                # Check if the state with the specified name already exists
                existing_permission = cls.query.filter_by(name=permission_data['name']).first()

                if existing_permission is None:
                    new_permission = cls(**permission_data)
                    db.session.add(new_permission)

            super_admin_role = Role.query.filter_by(name='Admin').first()
            objects = []
            if super_admin_role is not None:
                permissions = Permission.query.all()

                for item in permissions:
                    new_object = RolePermission(role_id=super_admin_role.id, module_id=item.module_id, permission_id=item.id)
                    objects.append(new_object)

            db.session.add_all(objects)

            # Commit the changes to the database
            db.session.commit()
        except FileNotFoundError:
            return 'File not found'
        except Exception as e:
            return e