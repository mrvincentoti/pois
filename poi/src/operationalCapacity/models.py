from datetime import datetime
from .. import db 
from sqlalchemy import Column, Integer, ForeignKey, DateTime, event

class OperationalCapacity(db.Model):
    __tablename__ = 'operational_capacity'
    id = db.Column(db.Integer, primary_key=True)
    type_id = db.Column(db.Integer, nullable=False)
    org_id = db.Column(db.Integer, nullable=False)
    item = db.Column(db.String(255), nullable=False)
    qty = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'type_id': self.type_id,
            'org_id': self.org_id,
            'item': self.item,
            'qty': self.qty,
            'description': self.description,
            'created_by': self.created_by,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'deleted_at': self.updated_at
        }

    def __init__(self, type_id=None, org_id=None, item=None, qty=None, description=None, created_by=None, created_at=None, updated_at=None, deleted_at=None):
        self.type_id = type_id
        self.org_id = org_id
        self.item = item
        self.qty = qty
        self.description = description
        self.created_at = created_at
        self.created_by = created_by
        self.updated_at = updated_at
        self.deleted_at = deleted_at
        

    def update(self, org_id=None, type_id=None, item=None, qty=None, description=None, updated_at=None):
        if org_id is not None:
            self.org_id = org_id
        if type_id is not None:
            self.type_id = type_id
        if item is not None:
            self.item = item
        if qty is not None:
            self.qty = qty
        if description is not None:
            self.description = description
        if updated_at is not None:
            self.updated_at = updated_at
        
        db.session.commit()
        
    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None
