from datetime import datetime
from sqlalchemy import func, event
from sqlalchemy.ext.hybrid import hybrid_property
from .. import db

class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(256), nullable=True)
    feedback = db.Column(db.Text, nullable=True)
    attachment = db.Column(db.Text(length=200000000), unique=False, nullable=True)
    status = db.Column(db.Integer, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=True)


    def __init__(self, subject=None, attachment=None,  feedback=None, status=None, created_by=None, created_at=None, deleted_at=None):
        self.subject = subject
        self.attachment = attachment
        self.feedback = feedback
        self.status = status
        self.deleted_at = deleted_at
        self.created_by = created_by
        self.created_at = created_at

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, subject=None, attachment=None, feedback=None, status=None, deleted_at=None):
        if subject:
            self.subject = subject
        if attachment:
            self.attachment = attachment
        if feedback:
            self.feedback = feedback
        if status:
            self.status = status
        if deleted_at:
            self.deleted_at = deleted_at

        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'subject': self.subject,
            'attachment': self.attachment,
            'feedback': self.feedback,
            'status': self.status,
            'deleted_at': self.deleted_at,
            'created_at': self.created_at,
            'created_by': self.created_by
        }

    def __repr__(self):
        return f'<Feedback {self.name}>'

@event.listens_for(Feedback, 'before_insert')
def before_insert_listener(mapper, connection, target):
    target.created_at = target.updated_at = datetime.utcnow()
