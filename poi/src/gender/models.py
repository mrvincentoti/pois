from .. import db # from __init__.py
from ..util import decrypt, encrypt


class Gender(db.Model):
    __tablename__ = 'genders'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(5000))

    @classmethod
    def create_seed_data(cls):
        # Sample data for states
        genders_data = [
            {"id": "1", "name": "Female"},
            {"id": "2", "name": "Male"},
        ]

        # Loop through the sample data and add to the database
        for gender_data in genders_data:
            # Check if the state with the specified id already exists
            existing_gender = cls.query.filter_by(id=gender_data['id']).first()

            if existing_gender is None:
                new_gender = cls(**gender_data)
                db.session.add(new_gender)

        # Commit the changes to the database
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name)
        }

    def __init__(self, id, name):
        self.id = id
        self.name = encrypt(name)
