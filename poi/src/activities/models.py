from datetime import datetime
from .. import db  # from __init__.py

class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    poi_id = db.Column(db.Integer, db.ForeignKey('poi.id'))
    comment = db.Column(db.String(252))
    activity_date = db.Column(db.DateTime, nullable=True)
    
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'poi_id': self.poi_id,
            'comment': self.comment,
            'activity_date': self.activity_date,
            'created_by': self.created_by,
            'created_at': self.created_at,
            'deleted_at': self.deleted_at
        }

    def __init__(self, poi_id=None, comment=None, activity_date=None, created_by=None,
                created_at=None):
        self.poi_id = poi_id
        self.comment = comment
        self.activity_date = activity_date
        self.created_by = created_by
        self.created_at = created_at
    
    def __repr__(self):
        return f'<Activity id={self.id}>'
    
    def soft_delete(self):
        self.deleted_at = datetime.utcnow()

    def restore(self):
        self.deleted_at = None
        
    def update(self, poi_id=None, comment=None, activity_date=None, created_by=None,
                created_at=None, deleted_at=None):
        if poi_id is not None:
            self.poi_id = poi_id
        if comment is not None:
            self.comment = comment
        if activity_date is not None:
            self.activity_date = activity_date
        if created_by is not None:
            self.created_by = created_by
        if created_at is not None:
            self.created_at = created_at
        
        db.session.commit()