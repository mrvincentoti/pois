from .. import db # from __init__.py
from datetime import datetime

class RolePermission(db.Model):
    __tablename__ = 'role_permissions'

    id = db.Column(db.Integer, primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"))
    permission_id = db.Column(db.Integer, db.ForeignKey("permissions.id"))
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"))

    def __init__(self, role_id, module_id, permission_id):
        self.role_id = role_id
        self.module_id = module_id
        self.permission_id= permission_id


    def __repr__(self):
        return f'<RolePermission {self}>'

    def soft_delete(self):
        self.deleted_at = datetime.now()