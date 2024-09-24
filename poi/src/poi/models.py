from contextlib import nullcontext
from datetime import datetime
from sqlalchemy import func, event
from sqlalchemy.ext.hybrid import hybrid_property
from .. import db


class Poi(db.Model):
    __tablename__ = 'poi'

    id = db.Column(db.Integer, primary_key=True) #captured
    ref_numb = db.Column(db.String(64), unique=False, nullable=True) #captured
    picture = db.Column(db.Text, unique=False, nullable=True)  # captured
    first_name = db.Column(db.String(64), nullable=False) #captured
    middle_name = db.Column(db.String(64), nullable=True) #captured
    last_name = db.Column(db.String(64), nullable=False) #captured
    alias = db.Column(db.Text, unique=False, nullable=True)
    dob = db.Column(db.Date, nullable=True) #captured
    passport_number = db.Column(db.String(64), nullable=True) #captured
    other_id_number = db.Column(db.String(64), nullable=True) #captured
    phone_number = db.Column(db.String(64), nullable=True) #captured
    email = db.Column(db.String(64), nullable=True) #captured
    role = db.Column(db.String(64), nullable=True) #captured
    affiliation = db.Column(db.Text, unique=False, nullable=True)
    address = db.Column(db.Text, nullable=True) #captured
    remark = db.Column(db.Text, nullable=True) #captured
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id')) #captured
    source_id = db.Column(db.Integer, db.ForeignKey('sources.id')) #captured
    country_id = db.Column(db.Integer, db.ForeignKey('country.id')) #captured
    state_id = db.Column(db.Integer, db.ForeignKey('state.id')) #captured
    gender_id = db.Column(db.Integer, db.ForeignKey('genders.id')) #captured
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=True)

    category = db.relationship("Category", backref="poi")
    source = db.relationship("Source", backref="poi")
    country = db.relationship("Country", backref="poi")
    state = db.relationship("State", backref="poi")
    gender = db.relationship("Gender", backref="poi")

    def __init__(self, ref_numb=None, picture=None, first_name=None, middle_name=None, last_name=None, alias=None, dob=None,
                passport_number=None, other_id_number=None, phone_number=None, email=None, role=None,
                affiliation=None, address=None, remark=None, category_id=None, source_id=None, country_id=None, state_id=None, gender_id=None, deleted_at=None,
                created_at=None, created_by=None):
        self.ref_numb = ref_numb
        self.picture = picture
        self.first_name = first_name
        self.middle_name = middle_name
        self.last_name = last_name
        self.alias = alias
        self.dob = dob
        self.passport_number = passport_number
        self.other_id_number = other_id_number
        self.phone_number = phone_number
        self.email = email
        self.role = role
        self.affiliation = affiliation
        self.address = address
        self.remark = remark
        self.category_id = category_id
        self.source_id = source_id
        self.country_id = country_id
        self.state_id = state_id
        self.gender_id = gender_id
        self.deleted_at = deleted_at
        self.created_at = created_at
        self.created_by = created_by

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, first_name, last_name, ref_numb=None, dob=None, passport_number=None, other_id_number=None, phone_number=None,
            email=None, role=None, affiliation=None, address=None, remark=None, middle_name=None, alias=None,picture=None,
            category_id=None, source_id=None, country_id=None, state_id=None, gender_id=None, deleted_at=None, created_by=None):
        if first_name:
            self.first_name = first_name
        if picture:
            self.picture = picture
        if last_name:
            self.last_name = last_name
        if ref_numb:
            self.ref_numb = ref_numb
        if dob:
            self.dob = dob
        if passport_number:
            self.passport_number = passport_number
        if other_id_number:
            self.other_id_number = other_id_number
        if phone_number:
            self.phone_number = phone_number
        if email:
            self.email = email
        if role:
            self.role = role
        if affiliation:
            self.affiliation = affiliation
        if address:
            self.address = address
        if remark:
            self.remark = remark
        if middle_name:
            self.middle_name = middle_name
        if alias:
            self.alias = alias
        if category_id:
            self.category_id = category_id
        if source_id:
            self.source_id = source_id
        if country_id:
            self.country_id = country_id
        if state_id:
            self.state_id = state_id
        if gender_id:
            self.gender_id = gender_id
        if deleted_at:
            self.deleted_at = deleted_at
        if created_by:
            self.created_by = created_by

        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'ref_numb': self.ref_numb,
            'picture': self.picture,
            'first_name': self.first_name,
            'middle_name': self.middle_name,
            'last_name': self.last_name,
            'alias': self.alias,
            'dob': self.dob,
            'passport_number': self.passport_number,
            'other_id_number': self.other_id_number,
            'phone_number': self.phone_number,
            'email': self.email,
            'role': self.role,
            'affiliation': self.affiliation,
            'address': self.address,
            'remark': self.remark,
            'category': self.category.to_dict() if self.category else None,
            'source': self.source.to_dict() if self.source else None,
            'country': self.country.to_dict() if self.country else None,
            'state': self.state.to_dict() if self.state else None,
            'gender': self.gender.to_dict() if self.gender else None,
            'deleted_at': self.deleted_at,
            'created_at': self.created_at,
            'created_by': self.created_by
        }

    def __repr__(self):
        return f'<Poi {self.name}>'


@event.listens_for(Poi, 'before_insert')
def before_insert_listener(mapper, connection, target):
    target.created_at = target.updated_at = datetime.utcnow()