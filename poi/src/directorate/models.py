from datetime import datetime
from .. import db # from __init__.py
from ..util import encrypt, decrypt

class Directorate(db.Model):
    __tablename__ = 'directorate'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500))
    description = db.Column(db.String(500))
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, name, description):
        self.name = encrypt(name)
        self.description = encrypt(description)
        
        
    def soft_delete(self):
        self.deleted_at = datetime.now()
    
    def restore(self):
        self.deleted_at = None
        
    def save(self):
        db.session.add(self)
        db.session.commit()
        
    def update(self, name=None, description=None):
        if name:
            self.name = encrypt(name)
        if description:
            self.description = encrypt(description)
        db.session.commit()
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name),
            'description': decrypt(self.description),
            'deleted_at': self.deleted_at
        }
    
    def __repr__(self):
        return f'<Directorate {self.name}>'