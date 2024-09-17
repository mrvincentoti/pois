from .. import db

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }

    def __init__(self, id, name):
        self.id = id
        self.name = name
