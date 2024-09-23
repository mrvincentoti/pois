from .. import db
from datetime import datetime

class CrimeCommitted(db.Model):
    __tablename__ = 'crime_committed'
    
    id = db.Column(db.Integer, primary_key=True)
    poi_id = poi_id = db.Column(db.Integer, db.ForeignKey('poi.id'))
    crime_id = db.Column(db.Integer, db.ForeignKey('crimes.id'), nullable=True)
    crime_date = db.Column(db.Date, nullable=True)
    casualties_recorded = db.Column(db.Integer, nullable=True)
    place_of_detention = db.Column(db.String(255), nullable=True)
    arresting_body_id = db.Column(db.Integer, db.ForeignKey('arresting_body.id'), nullable=True)
    action_taken = db.Column(db.Text, nullable=True)
    comments = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Automatically sets current time
    deleted_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    poi = db.relationship('Poi', backref='poi', lazy=True)
    crime = db.relationship('Crime', backref='crime_committed', lazy=True)
    arresting_body = db.relationship('ArrestingBody', backref='crime_committed', lazy=True)
    user = db.relationship('User', backref='crime_committed', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'poi_id': self.poi_id,
            'crime_id': self.crime_id,
            'crime_date': self.crime_date,
            'casualties_recorded': self.casualties_recorded,
            'arresting_body_id': self.arresting_body_id,
            'place_of_detention': self.place_of_detention,
            'action_taken': self.action_taken,
            'comments': self.comments,
            'created_by': self.created_by,
            'created_at': self.created_at,
            'deleted_at': self.deleted_at
        }

    def __init__(self, poi_id=None, crime_id=None, crime_date=None, casualties_recorded=None, arresting_body_id=None, 
                place_of_detention=None, action_taken=None, comments=None, created_by=None, created_at=None):
        self.poi_id = poi_id
        self.crime_id = crime_id
        self.crime_date = crime_date
        self.casualties_recorded = casualties_recorded
        self.arresting_body_id = arresting_body_id
        self.place_of_detention = place_of_detention
        self.action_taken = action_taken
        self.comments = comments
        self.created_by = created_by
        self.created_at = created_at

    def __repr__(self):
        return f'<CrimeCommitted id={self.id} crime_id={self.crime_id}>'

    def soft_delete(self):
        self.deleted_at = datetime.utcnow()

    def restore(self):
        self.deleted_at = None

    def update(self, poi_id=None, crime_id=None, arresting_body_id=None, place_of_detention=None, action_taken=None, 
            crime_date=None, casualties_recorded=None, comments=None):
        if poi_id:
            self.poi_id = poi_id
        if crime_id:
            self.crime_id = crime_id
        if arresting_body_id:
            self.arresting_body_id = arresting_body_id
        if place_of_detention:
            self.place_of_detention = place_of_detention
        if action_taken:
            self.action_taken = action_taken
        if crime_date:
            self.crime_date = crime_date
        if casualties_recorded:
            self.casualties_recorded = casualties_recorded
        if comments:
            self.comments = comments
