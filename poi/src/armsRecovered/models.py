from .. import db

class ArmsRecovered(db.Model):
    __tablename__ = 'arms_recovered'
    id = db.Column(db.Integer, primary_key=True)
    poi_id = db.Column(db.Integer, db.ForeignKey('poi.id'))
    arm_id = db.Column(db.Integer, db.ForeignKey('arms.id'))
    number_recovered = db.Column(db.Integer, nullable=True)
    ammunition = db.Column(db.String(64))
    arm = db.relationship("Arms", backref="arms_recovered")
    poi = db.relationship("Poi", backref="arms_recovered")

    def to_dict(self):
        return {
            'id': self.id,
            'poi_id': self.poi_id,
            'arm_id': self.arm_id,
            'number_recovered': self.number_recovered,
            'ammunition': self.ammunition
        }

    def __init__(self, id, name):
        self.id = id
        self.name = name
