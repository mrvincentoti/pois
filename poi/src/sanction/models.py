from datetime import datetime

from .. import db
from ..util import encrypt, decrypt

class Sanction(db.Model):
    __tablename__ = "sanction"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, name, description):
        self.name = encrypt(name)
        self.description = encrypt(description)

    def __repr__(self):
        return f"<Sanction {self.name}>"

    def soft_delete(self):
        self.deleted_at = datetime.now()
        self.deleted_at = datetime.utcnow()

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
