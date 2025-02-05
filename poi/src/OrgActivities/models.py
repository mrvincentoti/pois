from datetime import datetime
from .. import db  # from __init__.py

class OrgActivity(db.Model):
    __tablename__ = 'org_activities'
    id = db.Column(db.Integer, primary_key=True)
    type_id = db.Column(db.Integer, nullable=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organisation.id'))
    title = db.Column(db.String(255), nullable=True)
    crime_id = db.Column(db.Integer, db.ForeignKey('crimes.id'), nullable=True)
    casualties_recorded = db.Column(db.Integer, nullable=True)
    nature_of_attack = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    action_taken = db.Column(db.Text, nullable=True)
    comment = db.Column(db.Text, nullable=True)
    activity_date = db.Column(db.DateTime, nullable=True)
    location_from = db.Column(db.String(64), nullable=True)
    location_to = db.Column(db.String(64), nullable=True)
    facilitator = db.Column(db.String(64), nullable=True)

    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 

    def to_dict(self):
        return {
            'id': self.id,
            'type_id': self.type_id,
            'org_id': self.org_id,
            'title': self.title,
            'crime_id': self.crime_id,
            'casualties_recorded': self.casualties_recorded,
            'nature_of_attack': self.nature_of_attack,
            'location': self.location,
            'action_taken': self.action_taken,
            'comment': self.comment,
            'location_from': self.location_from,
            'location_to': self.location_to,
            'facilitator': self.facilitator,
            'activity_date': self.activity_date,
            'created_by': self.created_by,
            'created_at': self.created_at,
            'deleted_at': self.deleted_at
        }

    def __init__(self, type_id=None, org_id=None, title=None, crime_id=None, casualties_recorded=None, nature_of_attack=None, location=None, action_taken=None, comment=None, location_from=None, location_to=None, facilitator=None, activity_date=None, created_by=None,
                created_at=None, updated_at=None):
        self.type_id = type_id
        self.org_id = org_id
        self.title = title
        self.crime_id = crime_id
        self.casualties_recorded = casualties_recorded
        self.nature_of_attack = nature_of_attack
        self.location = location
        self.action_taken = action_taken
        self.comment = comment
        self.location_from = location_from
        self.location_to =location_to
        self.facilitator = facilitator
        self.activity_date = activity_date
        self.created_by = created_by
        self.created_at = created_at
        self.updated_at = updated_at
    
    def __repr__(self):
        return f'<OrgActivity id={self.id}>'
    
    def soft_delete(self):
        self.deleted_at = datetime.utcnow()

    def restore(self):
        self.deleted_at = None
        
    def update(self, type_id=None, org_id=None, title=None, crime_id=None, casualties_recorded=None, nature_of_attack=None, location=None, action_taken=None, comment=None, location_from=None, location_to=None, facilitator=None, activity_date=None, created_by=None,
                updated_at=None):
        if type_id is not None:
            self.type_id = type_id
        if org_id is not None:
            self.org_id = org_id
        if title is not None:
            self.title = title
        if crime_id:
            self.crime_id = crime_id
        if casualties_recorded:
            self.casualties_recorded = casualties_recorded
        if nature_of_attack:
            self.nature_of_attack = nature_of_attack
        if location:
            self.location = location
        if action_taken:
            self.action_taken = action_taken
        if comment is not None:
            self.comment = comment
        if location_from is not None:
            self.location_from = location_from
        if location_to is not None:
            self.location_to =location_to
        if facilitator is not None:
            self.facilitator = facilitator
        if activity_date is not None:
            self.activity_date = activity_date
        if updated_at is not None:
            self.updated_at = updated_at
        
        db.session.commit()