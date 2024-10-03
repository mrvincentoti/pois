from datetime import datetime
from .. import db # from __init__.py

class Address(db.Model):
    __tablename__ = 'addresses'
    id = db.Column(db.Integer, primary_key=True)
    poi_id = db.Column(db.Integer, db.ForeignKey('poi.id'))
    address_type = db.Column(db.String(64))
    address = db.Column(db.Text, nullable=True)
    latitude = db.Column(db.String(64), nullable=True)
    longitude = db.Column(db.String(64), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    poi = db.relationship('Poi', backref='poi', lazy=True)
    
    def soft_delete(self):
        self.deleted_at = datetime.now()
        
    def __repr__(self):
        return f'<Directorate {self.name}>'