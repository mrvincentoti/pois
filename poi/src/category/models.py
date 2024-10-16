from .. import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    description = db.Column(db.Text, nullable=True)
    category_type = db.Column(db.String(64))
    deleted_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category_type': self.category_type,
            'deleted_at': self.deleted_at
        }

    def __init__(self, name, description, category_type):
        self.name = name
        self.description = description
        self.category_type = category_type

    def __repr__(self):
        return f'<Category {self.name}>'

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None