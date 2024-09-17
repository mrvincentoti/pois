
from .. import db # from __init__.py
class Deployment(db.Model):
    __tablename__ = 'deployment'
    id = db.Column(db.Integer, primary_key=True)
    country = db.Column(db.String(45))
    region = db.Column(db.String(45))
    station = db.Column(db.String(45))
    assumption_date = db.Column(db.DateTime)
    expected_return_date = db.Column(db.DateTime)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'))
    employee = db.relationship('Employee', backref='deployments')
    deleted_at = db.Column(db.DateTime, nullable=True)