
from .. import db # from __init__.py
class Contact(db.Model):
    __tablename__ = 'contact'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(45))
    phone = db.Column(db.String(45))
    tel = db.Column(db.String(45))
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'))
    employee = db.relationship('Employee', backref='contacts')