from datetime import datetime
from sqlalchemy import func, event
from sqlalchemy.ext.hybrid import hybrid_property
from .. import db
from ..util import encrypt, decrypt


class Organisation(db.Model):
    __tablename__ = 'organisation'

    id = db.Column(db.Integer, primary_key=True)
    ref_numb = db.Column(db.String(64), unique=True, nullable=True)
    reg_numb = db.Column(db.String(64), nullable=True)
    org_name = db.Column(db.String(64), nullable=False)
    picture = db.Column(db.Text(length=200000000), unique=False, nullable=True)
    date_of_registration = db.Column(db.Date, nullable=True)
    address = db.Column(db.Text, nullable=True)
    hq = db.Column(db.String(64), nullable=True)
    nature_of_business = db.Column(db.String(64), nullable=True)
    phone_number = db.Column(db.String(64), nullable=True)
    countries_operational = db.Column(db.String(64), nullable=True)
    investors = db.Column(db.Text, nullable=True)
    ceo = db.Column(db.String(64), nullable=True)
    board_of_directors = db.Column(db.Text, nullable=True)
    employee_strength = db.Column(db.Integer, nullable=True)
    affiliations = db.Column(db.Text, nullable=True)
    website = db.Column(db.String(64), nullable=True)
    fb = db.Column(db.String(64), nullable=True)
    instagram = db.Column(db.String(64), nullable=True)
    twitter = db.Column(db.String(64), nullable=True)
    telegram = db.Column(db.String(64), nullable=True)
    tiktok = db.Column(db.String(64), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    source_id = db.Column(db.Integer, db.ForeignKey('sources.id'))
    remark = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=True)
    category = db.relationship("Category", backref="organisation")
    source = db.relationship("Source", backref="organisation")


    def __init__(self, ref_numb=None, reg_numb=None, org_name=None, date_of_registration=None, address=None, hq=None, nature_of_business=None, phone_number=None, countries_operational=None, investors=None, ceo=None, board_of_directors=None, employee_strength=None, affiliations=None, website=None, fb=None, instagram=None, twitter=None, telegram=None, tiktok=None, category_id=None, source_id=None, remark=None, deleted_at=None):
        self.ref_numb = ref_numb
        self.reg_numb = reg_numb
        self.org_name = org_name
        self.date_of_registration = date_of_registration
        self.address = address
        self.hq = hq
        self.nature_of_business = nature_of_business
        self.phone_number = phone_number
        self.countries_operational = countries_operational
        self.investors = investors
        self.ceo = ceo
        self.board_of_directors = board_of_directors
        self.employee_strength = employee_strength
        self.affiliations = affiliations
        self.website = website
        self.fb = fb
        self.instagram = instagram
        self.twitter = twitter
        self.telegram = telegram
        self.tiktok = tiktok
        self.category_id = category_id
        self.source_id = source_id
        self.remark = remark
        self.deleted_at = deleted_at

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, ref_numb=None, reg_numb=None, org_name=None, date_of_registration=None, address=None, hq=None,
               nature_of_business=None, phone_number=None, countries_operational=None, investors=None, ceo=None,
               board_of_directors=None, employee_strength=None, affiliations=None, website=None, fb=None,
               instagram=None,
               twitter=None, telegram=None, tiktok=None, category_id=None, source_id=None, remark=None,
               deleted_at=None):

        if ref_numb:
            self.ref_numb = ref_numb
        if reg_numb:
            self.reg_numb = reg_numb
        if org_name:
                self.org_name = org_name
        if date_of_registration:
            self.date_of_registration = date_of_registration
        if address:
            self.address = address
        if hq:
            self.hq = hq
        if nature_of_business:
            self.nature_of_business = nature_of_business
        if phone_number:
            self.phone_number = phone_number
        if countries_operational:
            self.countries_operational = countries_operational
        if investors:
            self.investors = investors
        if ceo:
            self.ceo = ceo
        if board_of_directors:
            self.board_of_directors = board_of_directors
        if employee_strength:
            self.employee_strength = employee_strength
        if affiliations:
            self.affiliations = affiliations
        if website:
            self.website = website
        if fb:
            self.fb = fb
        if instagram:
            self.instagram = instagram
        if twitter:
            self.twitter = twitter
        if telegram:
            self.telegram = telegram
        if tiktok:
            self.tiktok = tiktok
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
            'ref_numb': self.ref_numb,
            'reg_numb': self.reg_numb,
            'org_name': self.org_name,
            'date_of_registration': self.date_of_registration,
            'address': self.address,
            'hq': self.hq,
            'nature_of_business': self.nature_of_business,
            'phone_number': self.phone_number,
            'countries_operational': self.countries_operational,
            'investors': self.investors,
            'ceo': self.ceo,
            'board_of_directors': self.board_of_directors,
            'employee_strength': self.employee_strength,
            'affiliations': self.affiliations,
            'website': self.website,
            'fb': self.fb,
            'instagram': self.instagram,
            'twitter': self.twitter,
            'telegram': self.telegram,
            'tiktok': self.tiktok,
            'category_id': self.category_id,
            'source_id': self.source_id,
            'remark': self.remark,
            'deleted_at': self.deleted_at,
        }

    def __repr__(self):
        return f'<Organisation {self.name}>'

@event.listens_for(Organisation, 'before_insert')
def before_insert_listener(mapper, connection, target):
    target.created_at = target.updated_at = datetime.utcnow()
