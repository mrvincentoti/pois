from sqlalchemy import inspect
from datetime import datetime
from .. import db # from __init__.py

class Role(db.Model):
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    permissions = db.relationship('Permission', secondary='role_permissions', back_populates='roles')

    def __init__(self, name, description):
        self.name = name
        self.description = description

    def __repr__(self):
        return f'<Role {self.name}>'

    def soft_delete(self):
        self.deleted_at = datetime.now()
    
    def restore(self):
        self.deleted_at = None

    @classmethod
    def create_seed_data(cls):
        # Sample data for roles
        roles_data = [
            {"name": "User", "description": "User"},
            {"name": "Admin", "description": "Administrator"},
        ]

        # Loop through the sample data and add to the database
        for roles in roles_data:
            new_role = cls(**roles)
            db.session.add(new_role)

        # Commit the changes to the database
        db.session.commit()