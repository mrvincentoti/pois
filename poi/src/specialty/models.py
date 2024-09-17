
from datetime import datetime
from .. import db # from __init__.py
from ..util import encrypt, decrypt

class Specialty(db.Model):
    __tablename__ = 'specialty'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    def __init__(self, name):
        self.name = encrypt(name)
    
    def soft_delete(self):
        self.deleted_at = datetime.now()
    
    def restore(self):
        self.deleted_at = None
        
    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, name=None):
        if name:
            self.name = encrypt(name)
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name),
            'deleted_at': self.deleted_at
        }
        
    def __repr__(self):
        return f'<Specialty {self.name}>'
