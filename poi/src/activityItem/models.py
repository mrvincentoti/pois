from datetime import datetime
from .. import db  # from __init__.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, event

class ActivityItem(db.Model):
    __tablename__ = 'activity_items'
    id = db.Column(db.Integer, primary_key=True)
    poi_id = db.Column(db.Integer, db.ForeignKey('poi.id'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id'), nullable=False)
    item = db.Column(db.String(255), nullable=False)
    qty = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'activity_id': self.activity_id,
            'poi_id': self.poi_id,
            'item': self.item,
            'qty': self.qty,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    def __init__(self, poi_id=None, activity_id=None, item=None, qty=None, created_at=None, updated_at=None):
        self.poi_id = poi_id
        self.activity_id = activity_id
        self.item = item
        self.qty = qty
        self.created_at = created_at
        self.updated_at = updated_at
        

    def update(self, poi_id=None, activity_id=None, item=None, qty=None, updated_at=None):
        if poi_id is not None:
            self.poi_id = poi_id
        if activity_id is not None:
            self.activity_id = activity_id
        if item is not None:
            self.item = item
        if qty is not None:
            self.qty = qty
        if updated_at is not None:
            self.updated_at = updated_at
        
        db.session.commit()
        
    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None
