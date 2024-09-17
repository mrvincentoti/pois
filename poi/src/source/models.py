from .. import db

class Source(db.Model):
    __tablename__ = 'sources'
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
