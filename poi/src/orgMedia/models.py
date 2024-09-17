from datetime import datetime
from .. import db  # from __init__.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, event

from ..util import encrypt, decrypt


class OrgMedia(db.Model):
    __tablename__ = 'org_media'

    id = db.Column(db.Integer, primary_key=True)
    document_url = db.Column(db.String(255), nullable=True)
    picture_url = db.Column(db.String(255), nullable=True)
    audio_url = db.Column(db.String(255), nullable=False)
    video_url = db.Column(db.String(255), nullable=True)
    organisation_id = db.Column(db.Integer, db.ForeignKey('organisation.id'), nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    organisation = db.relationship('Organisation', backref='org_media')

    def __init__(self, document_url=None, picture_url=None, audio_url=None, video_url=None, poi_id=None,
                 deleted_at=None):
        self.document_url = document_url
        self.picture_url = picture_url
        self.audio_url = audio_url
        self.video_url = video_url
        self.poi_id = poi_id
        self.deleted_at = deleted_at

    def update(self, document_url=None, picture_url=None, audio_url=None, video_url=None, poi_id=None, deleted_at=None):
        if document_url is not None:
            self.document_url = document_url
        if picture_url is not None:
            self.picture_url = picture_url
        if audio_url is not None:
            self.audio_url = audio_url
        if video_url is not None:
            self.video_url = video_url
        if poi_id is not None:
            self.poi_id = poi_id
        if deleted_at is not None:
            self.deleted_at = deleted_at
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'document_url': self.document_url,
            'picture_url': self.picture_url,
            'audio_url': self.audio_url,
            'video_url': self.video_url,
            'organisation_id': self.organisation_id,
            'deleted_at': self.deleted_at,
            'created_at': self.created_at
        }

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None


@event.listens_for(OrgMedia, 'before_insert')
def before_insert_listener(mapper, connection, target):
    target.created_at = target.updated_at = datetime.utcnow()
