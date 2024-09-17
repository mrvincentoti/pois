from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .. import db
from ..util import decrypt, encrypt


class Rank(db.Model):
    __tablename__ = "rank"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    level = db.Column(db.Integer, nullable=False)
    cadre_id = db.Column(db.Integer, db.ForeignKey('cadre.id'))
    cadre = db.relationship('Cadre')
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, name, description, level, cadre_id=None):
        self.name = encrypt(name)
        self.description = encrypt(description)
        self.level = level
        self.cadre_id = cadre_id

    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name),
            'description': decrypt(self.description),
            'level': self.level,
            'deleted_at': self.deleted_at,
            'cadre': self.cadre.to_dict()
        }

    def __repr__(self):
        return f"<Rank {self.name}>"

    def soft_delete(self):
        self.deleted_at = datetime.utcnow()

    def restore(self):
        self.deleted_at = None
        
    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, name=None, description=None, level=None, cadre_id=None):
        if name:
            self.name = encrypt(name)
        if description:
            self.description = encrypt(description)
        if level:
            self.level = level
        if cadre_id:
            self.cadre_id = cadre_id
        db.session.commit()


