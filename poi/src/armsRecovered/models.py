from datetime import datetime
from .. import db  # from __init__.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, event

class ArmsRecovered(db.Model):
    __tablename__ = 'arms_recovered'
    id = db.Column(db.Integer, primary_key=True)
    poi_id = db.Column(db.Integer, db.ForeignKey('poi.id'))
    arm_id = db.Column(db.Integer, db.ForeignKey('arms.id'))
    location = db.Column(db.String(64))
    comments = db.Column(db.String(252))
    recovery_date = db.Column(db.DateTime, nullable=True)
    
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    arm = db.relationship("Arms", backref="arms_recovered")
    poi = db.relationship("Poi", backref="arms_recovered")

    def to_dict(self):
        return {
            'id': self.id,
            'poi_id': self.poi_id,
            'arm_id': self.arm_id,
            'location': self.location,
            'comments': self.comments,
            'recovery_date': self.recovery_date,
            'created_by': self.created_by,
            'created_at': self.created_at,
            'deleted_at': self.deleted_at
        }

    def __init__(self, poi_id=None, arm_id=None, location=None, comments=None, recovery_date=None, created_by=None,
                created_at=None, deleted_at=None):
        self.poi_id = poi_id
        self.arm_id = arm_id
        self.location = location
        self.comments = comments
        self.recovery_date = recovery_date
        self.created_by = created_by
        self.created_at = created_at
        self.deleted_at = deleted_at
        

    def update(self, poi_id=None, arm_id=None, location=None, comments=None, recovery_date=None, created_by=None,
                created_at=None, deleted_at=None):
        if poi_id is not None:
            self.poi_id = poi_id
        if arm_id is not None:
            self.arm_id = arm_id
        if location is not None:
            self.location = location
        if comments is not None:
            self.comments = comments
        if recovery_date is not None:
            self.recovery_date = recovery_date
        if created_by is not None:
            self.created_by = created_by
        if created_at is not None:
            self.created_at = created_at
        if deleted_at is not None:
            self.deleted_at = deleted_at
        
        db.session.commit()
        
    def soft_delete(self):
        self.deleted_at = datetime.now()
   
    def restore(self):
        self.deleted_at = None
