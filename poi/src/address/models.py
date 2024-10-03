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
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, poi_id=None, address_type=None, address=None, latitude=None, longitude=None,
                updated_at=None, created_at=None):
        self.poi_id = poi_id
        self.address_type = address_type
        self.address = address
        self.latitude = latitude
        self.longitude = longitude
        self.updated_at = updated_at
        self.created_at = created_at
        
    def __repr__(self):
        return f'<Address {self.name}>'
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def update(self, poi_id=None, address_type=None, address=None, latitude=None, longitude=None,
                updated_at=None, created_at=None):
        if poi_id:
            self.poi_id = poi_id
        if address_type:
            self.address_type = address_type
        if address:
            self.address = address
        if latitude:
            self.latitude = latitude
        if longitude:
            self.longitude = longitude
        if updated_at:
            self.updated_at = updated_at
        
        db.session.commit()