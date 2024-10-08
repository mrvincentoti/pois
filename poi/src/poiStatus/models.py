from .. import db # from __init__.py


class PoiStatus(db.Model):
    __tablename__ = 'poi_status'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(5000))

    @classmethod
    def create_seed_data(cls):
        status_data = [
            {"id": "1", "name": "Dead"},
            {"id": "2", "name": "At Large"},
            {"id": "3", "name": "Arrested"},
        ]

        for status in status_data:
            existing_status = cls.query.filter_by(id=status['id']).first()
            if existing_status is None:
                new_status = cls(**status)
                db.session.add(new_status)
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }

    def __init__(self, id, name):
        self.id = id
        self.name = name
