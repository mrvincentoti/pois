from datetime import datetime
from .. import db  # from __init__.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, event

class PoiMedia(db.Model):
    __tablename__ = 'poi_media'

    id = db.Column(db.Integer, primary_key=True)
    poi_id = db.Column(db.Integer, db.ForeignKey('poi.id'), nullable=False)
    media_type = db.Column(db.String(255), nullable=True)
    media_url = db.Column(db.String(255), nullable=True)
    media_caption = db.Column(db.String(255), nullable=True)
    crime_id = db.Column(db.Integer, db.ForeignKey('crime_committed.id'), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    poi = db.relationship('Poi', backref='poi_media')
    crime = db.relationship('CrimeCommitted', backref='poi_media')

    def __init__(self, media_type=None, media_url=None, media_caption=None, poi_id=None, crime_id=None,
            deleted_at=None, created_by=None, created_at=None):
        self.media_type = media_type
        self.media_url = media_url
        self.media_caption = media_caption
        self.poi_id = poi_id
        self.crime_id = crime_id
        self.deleted_at = deleted_at
        self.created_by = created_by
        self.created_at = created_at

    def update(self, media=None, media_url=None, media_caption=None, poi_id=None, crime_id=None, deleted_at=None, created_by=None):
        if media_type is not None:
            self.media_type = media_type
        if media_url is not None:
            self.media_url = media_url
        if poi_id is not None:
            self.poi_id = poi_id
        if crime_id is not None:
            self.crime_id = crime_id
        if deleted_at is not None:
            self.deleted_at = deleted_at
        if created_by is not None:
            self.created_by = created_by
        if media_caption is not None:
            self.media_caption = media_caption
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'poi_id': self.poi_id,
            'media_type': self.media_type,
            'media_url': self.media_url,
            'media_caption': self.media_caption,
            'crime_id': self.crime_id,
            'deleted_at': self.deleted_at,
            'created_at': self.created_at,
            'created_by': self.created_by
        }

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None


@event.listens_for(PoiMedia, 'before_insert')
def before_insert_listener(mapper, connection, target):
    target.created_at = target.updated_at = datetime.utcnow()
