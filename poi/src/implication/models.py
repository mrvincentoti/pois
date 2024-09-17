from .. import db  # from __init__.py
from ..util import encrypt, decrypt


class Implication(db.Model):
    __tablename__ = 'implication'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text(50000))
    # tyoe 1- promotion, 2-demotion
    type = db.Column(db.Integer)
    deleted_at = db.Column(db.DateTime, nullable=True)

    @classmethod
    def create_seed_data(cls):
        # Check if the table is empty before seeding
        if not cls.query.first():
            # Sample data for implications
            implications_data = [
                {"type": 1, "name": "promotion by one(1) rank"},
                {"type": 2, "name": "demotion by one(1) rank"}
            ]

            # Loop through the sample data and add to the database
            for implication_data in implications_data:
                new_implication = cls(**implication_data)
                db.session.add(new_implication)

            # Commit the changes to the database
            db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'type': decrypt(self.type),
            'name': decrypt(self.name),
            'deleted_at': self.deleted_at
        }
    def __init__(self, name, type):
        self.name = encrypt(name)
        self.type = type