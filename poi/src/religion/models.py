from .. import db  # from __init__.py
from ..util import encrypt, decrypt


class Religion(db.Model):
    __tablename__ = 'religions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500))

    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name),
        }

    @classmethod
    def create_seed_data(cls):
        # Sample data for religions
        religions_data = [
            {"id": "1", "name": "Muslim"},
            {"id": "2", "name": "Christian"},
        ]

        # Loop through the sample data and add to the database
        for religion_data in religions_data:
            # Check if the state with the specified id already exists
            existing_religion = cls.query.filter_by(id=religion_data['id']).first()

            if existing_religion is None:
                new_religion = cls(**religion_data)
                db.session.add(new_religion)

        # Commit the changes to the database
        db.session.commit()

    def __init__(self, id, name):
        self.id = id
        self.name = encrypt(name)
