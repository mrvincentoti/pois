from datetime import datetime
from .. import db  # from __init__.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, event

from ..util import encrypt, decrypt


class EmployeePosting(db.Model):
    __tablename__ = 'employee_posting'
    id = db.Column(db.Integer, primary_key=True)

    designation_at_post = db.Column(db.String(128), nullable=True)
    reason = db.Column(db.String(128), nullable=True)
    assumption_date = db.Column(db.String(128))
    expected_date_of_return = db.Column(db.String(128), nullable=True)
    date_of_return = db.Column(db.String(128), nullable=True)
    status = db.Column(db.Integer, nullable=True, default=1)
    posting_type = db.Column(db.Integer, nullable=True, default=0)  # 1 = extend, 2 = recall, 3 = cross-posting
    parent_id = db.Column(db.Integer, nullable=True)
    deleted_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('region.id'), nullable=False)
    station_id = db.Column(db.Integer, db.ForeignKey('station.id'), nullable=False)

    # Define relationships
    employee = db.relationship('Employee', backref='postings')
    region = db.relationship('Region', backref='postings')
    station = db.relationship('Station', backref='postings')

    def __init__(self, employee_id, region_id, station_id, designation_at_post=None, assumption_date=None,
                 expected_date_of_return=None, date_of_return=None, status=None, posting_type=None, parent_id=None,
                 reason=None):
        self.employee_id = employee_id
        self.region_id = region_id
        self.station_id = station_id
        self.designation_at_post = encrypt(designation_at_post)
        self.assumption_date = encrypt(assumption_date)
        self.expected_date_of_return = encrypt(expected_date_of_return)
        self.date_of_return = encrypt(date_of_return)
        self.status = status
        self.posting_type = posting_type
        self.parent_id = parent_id
        self.reason = encrypt(reason)

    def update(self, employee_id= None, region_id= None, station_id= None, designation_at_post=None, assumption_date=None,
               expected_date_of_return=None, date_of_return=None, status=None, posting_type=None, parent_id=None,
               reason=None):
        if employee_id:
            self.employee_id = employee_id
        if region_id:
            self.region_id = region_id
        if station_id:
            self.station_id = station_id
        if designation_at_post:
            self.designation_at_post = encrypt(designation_at_post)
        if status:
            self.status = status
        if assumption_date:
            self.assumption_date = encrypt(assumption_date)
        if expected_date_of_return:
            self.expected_date_of_return = encrypt(expected_date_of_return)
        if date_of_return:
            self.date_of_return = encrypt(date_of_return)
        if posting_type:
            self.posting_type = posting_type
        if parent_id:
            self.parent_id = parent_id
        if reason:
            self.reason = encrypt(reason)
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'employee': self.employee.basic_details(),
            'region': self.region.to_dict(),
            'station': self.station.to_dict(),
            'designation_at_post': decrypt(self.designation_at_post),
            'assumption_date': decrypt(self.assumption_date),
            'expected_date_of_return': decrypt(self.expected_date_of_return) if self.expected_date_of_return else None,
            'date_of_return': decrypt(self.date_of_return) if self.date_of_return else None,
            'status': self.status,
            'deleted_at': self.deleted_at if self.deleted_at else None,
            'posting_type': self.posting_type if self.posting_type else None,
            'parent_id': self.parent_id if self.parent_id else None,
            'is_extended': check_posting_extension(self.id),
            'reason': decrypt(self.reason) if self.reason else None,
            'is_recall': check_recall(self.id),
            'children': get_posting_children(self.id)
        }


    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None


def get_posting_children(posting_id):
    children_list = []
    postings = EmployeePosting.query.filter_by(
        parent_id=posting_id).order_by(EmployeePosting.id.asc())

    for posting in postings:
        children_data = posting.to_dict()
        children_list.append(children_data)

    return children_list


def check_posting_extension(posting_id):
    posting = EmployeePosting.query.filter_by(parent_id=posting_id).first()
    if posting:
        return True
    else:
        return False


def check_recall(posting_id):
    posting = EmployeePosting.query.filter_by(id=posting_id, posting_type=2).first()
    if posting:
        return True
    else:
        return False


@event.listens_for(EmployeePosting, 'before_insert')
def before_insert_listener(mapper, connection, target):
    target.created_at = target.updated_at = datetime.utcnow()
