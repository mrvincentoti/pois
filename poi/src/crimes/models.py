from .. import db
from datetime import datetime

class Crime(db.Model):
    __tablename__ = 'crimes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    description = db.Column(db.Text, nullable=True)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'<Crime {self.name}>'

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None