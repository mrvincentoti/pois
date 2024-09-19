from contextlib import nullcontext
from datetime import datetime
from sqlalchemy import func, event
from sqlalchemy.ext.hybrid import hybrid_property
from .. import db
from ..util import encrypt, decrypt


class Poi(db.Model):
    __tablename__ = 'poi'

    id = db.Column(db.Integer, primary_key=True)
    ref_numb = db.Column(db.String(64), unique=False, nullable=True)
    picture = db.Column(db.String(255), unique=False, nullable=True)
    first_name = db.Column(db.String(64), nullable=False)
    middle_name = db.Column(db.String(64), nullable=True)
    last_name = db.Column(db.String(64), nullable=False)
    alias = db.Column(db.String(64), nullable=True)
    dob = db.Column(db.Date, nullable=True)
    passport_number = db.Column(db.String(64), nullable=True)
    other_id_number = db.Column(db.String(64), nullable=True)
    phone_number = db.Column(db.String(64), nullable=True)
    email = db.Column(db.String(64), nullable=True)
    role = db.Column(db.String(64), nullable=True)
    affiliation_id = db.Column(db.Integer, db.ForeignKey('affiliations.id'), nullable=True)
    address = db.Column(db.Text, nullable=True)
    remark = db.Column(db.Text, nullable=True)
    crime_committed = db.Column(db.String(255), nullable=True)
    crime_date = db.Column(db.Date, nullable=True)
    casualties_recorded = db.Column(db.Integer, nullable=True)
    arresting_body = db.Column(db.String(255), nullable=True)
    place_of_detention = db.Column(db.String(255), nullable=True)
    action_taken = db.Column(db.String(255), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    source_id = db.Column(db.Integer, db.ForeignKey('sources.id'))
    country_id = db.Column(db.Integer, db.ForeignKey('country.id'))
    state_id = db.Column(db.Integer, db.ForeignKey('state.id'))
    gender_id = db.Column(db.Integer, db.ForeignKey('genders.id'))
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=True)

    category = db.relationship("Category", backref="poi")
    source = db.relationship("Source", backref="poi")
    country = db.relationship("Country", backref="poi")
    state = db.relationship("State", backref="poi")
    gender = db.relationship("Gender", backref="poi")
    affiliation = db.relationship("Affiliation", backref="poi")

    def __init__(self, ref_numb=None, picture=None, first_name=None, middle_name=None, last_name=None, alias=None, dob=None,
                 passport_number=None, other_id_number=None, phone_number=None, email=None, role=None,
                 affiliation_id=None, address=None, remark=None, crime_committed=None, crime_date=None,
                 casualties_recorded=None, arresting_body=None, place_of_detention=None, action_taken=None,
                 category_id=None, source_id=None, country_id=None, state_id=None, gender_id=None, deleted_at=None,
                 created_at=None):
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
        self.affiliation_id = affiliation_id
        self.address = address
        self.remark = remark
        self.crime_committed = crime_committed
        self.crime_date = crime_date
        self.casualties_recorded = casualties_recorded
        self.arresting_body = arresting_body
        self.place_of_detention = place_of_detention
        self.action_taken = action_taken
        self.category_id = category_id
        self.source_id = source_id
        self.country_id = country_id
        self.state_id = state_id
        self.gender_id = gender_id
        self.deleted_at = deleted_at
        self.created_at = created_at

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, first_name, last_name, ref_numb=None, dob=None, passport_number=None, other_id_number=None, phone_number=None,
               email=None, role=None, affiliation=None, address=None, remark=None, crime_committed=None, arresting_body=None, place_of_detention=None,
               action_taken=None, crime_date=None, casualties_recorded=None, middle_name=None, alias=None,picture=None,
               category_id=None, source_id=None, country_id=None, state_id=None, gender_id=None, deleted_at=None):
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
        if crime_committed:
            self.crime_committed = crime_committed
        if arresting_body:
            self.arresting_body = arresting_body
        if place_of_detention:
            self.place_of_detention = place_of_detention
        if action_taken:
            self.action_taken = action_taken
        if crime_date:
            self.crime_date = crime_date
        if casualties_recorded:
            self.casualties_recorded = casualties_recorded
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
            'affiliation': self.affiliation.to_dict() if self.affiliation else None,
            'address': self.address,
            'remark': self.remark,
            'crime_committed': self.crime_committed,
            'crime_date': self.crime_date,
            'casualties_recorded': self.casualties_recorded,
            'arresting_body': self.arresting_body,
            'place_of_detention': self.place_of_detention,
            'action_taken': self.action_taken,
            'category': self.category.to_dict() if self.category else None,
            'source': self.source.to_dict() if self.source else None,
            'country': self.country.to_dict() if self.country else None,
            'state': self.state.to_dict() if self.state else None,
            'gender': self.gender.to_dict() if self.gender else None,
            'deleted_at': self.deleted_at,
            'created_at': self.created_at
        }

    def __repr__(self):
        return f'<Poi {self.name}>'


@event.listens_for(Poi, 'before_insert')
def before_insert_listener(mapper, connection, target):
    target.created_at = target.updated_at = datetime.utcnow()