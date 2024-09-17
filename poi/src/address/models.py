from datetime import datetime
from .. import db # from __init__.py

class Directorate(db.Model):
    __tablename__ = 'directorate'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(16))
    description = db.Column(db.String(32))
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    def soft_delete(self):
        self.deleted_at = datetime.now()
        
    def __repr__(self):
        return f'<Directorate {self.name}>'