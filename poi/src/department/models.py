from datetime import datetime
from .. import db # from __init__.py
from ..util import encrypt, decrypt

class Department(db.Model):
    __tablename__ = 'department'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    description = db.Column(db.String(128))
    directorate_id = db.Column(db.Integer, db.ForeignKey('directorate.id'))
    deleted_at = db.Column(db.DateTime, nullable=True)
    directorate = db.relationship('Directorate', backref='departments')
    
    def __init__(self, name, description, directorate_id):
        self.name = encrypt(name)
        self.description = encrypt(description)
        self.directorate_id = directorate_id
    
    def soft_delete(self):
        self.deleted_at = datetime.now()
    
    def restore(self):
        self.deleted_at = None
        
    def save(self):
        db.session.add(self)
        db.session.commit()
        
    def update(self, name=None, description=None, directorate_id=None):
        if name:
            self.name = encrypt(name)
        if description:
            self.description = encrypt(description)
        if directorate_id:
            self.directorate_id = directorate_id
        db.session.commit()
        
    def to_dict(self):
        return {
            'id': self.id,
            'directorate_id': self.directorate_id,
            'name': decrypt(self.name),
            'description': decrypt(self.description),
            'deleted_at': self.deleted_at,
            'directorate': self.directorate.to_dict() if self.directorate else None
        }
        
    def __repr__(self):
        return f'<Department {self.name}>'