from .. import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    description = db.Column(db.Text, nullable=True)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'deleted_at': self.deleted_at
        }

    def __init__(self, name, description):
        self.name = name
        self.description = description

    def __repr__(self):
        return f'<Category {self.name}>'

    def soft_delete(self):
        self.deleted_at = datetime.now()
   
    def restore(self):
        self.deleted_at = None