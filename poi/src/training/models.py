from datetime import datetime
from .. import db # from __init__.py
from ..util import encrypt, decrypt

class Training(db.Model):
    __tablename__ = 'training'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    description = db.Column(db.String(128))
    category_id = db.Column(db.Integer, default=0)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    def __init__(self, name, description, category_id=None):
        self.name = encrypt(name)
        self.description = encrypt(description)
        self.category_id = category_id
    
    def soft_delete(self):
        self.deleted_at = datetime.now()

    def __init__(self, name, description):
        self.name = encrypt(name)
        self.description = encrypt(description)

    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name),
            'description': decrypt(self.description),
            'deleted_at': self.deleted_at
        }
    
    def restore(self):
        self.deleted_at = None
        
    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, name=None, description=None, category_id=None):
        if name:
            self.name = encrypt(name)
        if description:
            self.description = encrypt(description)
        if category_id:
            self.category_id = category_id
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name),
            'description': decrypt(self.description),
            'category_id': self.category_id,
            'deleted_at': self.deleted_at
        }
        
    def __repr__(self):
        return f'<Training {self.name}>'