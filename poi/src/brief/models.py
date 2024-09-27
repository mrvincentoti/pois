from datetime import datetime
from sqlalchemy import func, event
from sqlalchemy.ext.hybrid import hybrid_property
from .. import db

class Brief(db.Model):
    __tablename__ = 'brief'

    id = db.Column(db.Integer, primary_key=True)
    ref_numb = db.Column(db.String(64), unique=True, nullable=True)
    title = db.Column(db.String(64), nullable=True)
    picture = db.Column(db.Text(length=200000000), unique=False, nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    source_id = db.Column(db.Integer, db.ForeignKey('sources.id'))
    remark = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=True)
    
    category = db.relationship("Category", backref="brief")
    source = db.relationship("Source", backref="brief")


    def __init__(self, picture=None, ref_numb=None, title=None, category_id=None, source_id=None, remark=None, created_by=None, created_at=None, deleted_at=None):
        self.picture = picture
        self.ref_numb = ref_numb
        self.title = title
        self.category_id = category_id
        self.source_id = source_id
        self.remark = remark
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

    def update(self, picture=None, ref_numb=None, title=None, category_id=None, source_id=None, remark=None,
            deleted_at=None):
        if picture:
            self.picture = picture
        if ref_numb:
            self.ref_numb = ref_numb
        if title:
            self.title = title
        if category_id:
            self.category_id = category_id
        if source_id:
            self.source_id = source_id
        if remark:
            self.remark = remark
        if deleted_at:
            self.deleted_at = deleted_at

        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'picture': self.picture,
            'ref_numb': self.ref_numb,
            'title': self.title,
            'category_id': self.category_id,
            'source_id': self.source_id,
            'remark': self.remark,
            'deleted_at': self.deleted_at,
            'created_at': self.created_at,
            'created_by': self.created_by
        }

    def __repr__(self):
        return f'<Brief {self.name}>'

@event.listens_for(Brief, 'before_insert')
def before_insert_listener(mapper, connection, target):
    target.created_at = target.updated_at = datetime.utcnow()
