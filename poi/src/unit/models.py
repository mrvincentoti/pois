from datetime import datetime

from .. import db # from __init__.py
from ..util import encrypt, decrypt
class Unit(db.Model):
    __tablename__ = 'unit'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    description = db.Column(db.String(128))
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'))
    department = db.relationship('Department', backref='units')
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, name, description, department_id):
        self.name = encrypt(name)
        self.description = encrypt(description)
        self.department_id = department_id

    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name),
            'description': decrypt(self.description),
            'department': self.department.to_dict(),
            'deleted_at': self.deleted_at
        }
    def soft_delete(self):
        self.deleted_at = datetime.now()
        
    def restore(self):
        self.deleted_at = None
        
    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, name=None, description=None, department_id=None):
        if name:
            self.name = encrypt(name)
        if description:
            self.description = encrypt(description)
        if department_id:
            self.department_id = department_id
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name),
            'description': decrypt(self.description),
            'department_id': self.department_id,
            'deleted_at': self.deleted_at,
            'department': self.department.to_dict() if self.department else None
        }