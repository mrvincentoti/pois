# nok/models.py

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .. import db
from ..util import encrypt, decrypt


class NextOfKin(db.Model):
    __tablename__ = 'next_of_kin'

    id = Column(Integer, primary_key=True)
    firstname = Column(String(128), nullable=False)
    lastname = Column(String(128), nullable=False)
    email = Column(String(128), nullable=True)
    phone = Column(String(128), nullable=True)
    address = Column(String(255), nullable=True)
    relationship = Column(String(128), nullable=True)
    employee_id = Column(Integer, ForeignKey('employee.id'), nullable=False)
    deleted_at = Column(DateTime, default=None)
    category_id = Column(Integer, nullable=False)

    # Relationship with Employee
    employee = db.relationship('Employee', backref='next_of_kin')

    def __repr__(self):
        return f"<NextOfKin(id={self.id}, firstname={self.firstname}, lastname={self.lastname}, employee_id={self.employee_id}, deleted_at={self.deleted_at})>"

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None

    def __init__(self, employee_id, firstname, lastname, email, phone, address, relationship, category_id):
        self.employee_id = employee_id
        self.firstname = encrypt(firstname)
        self.lastname = encrypt(lastname)
        self.email = encrypt(email)
        self.phone = encrypt(phone)
        self.address = encrypt(address)
        self.relationship = encrypt(relationship)
        self.category_id = category_id

    def update(self, firstname=None, lastname=None, email=None, phone=None, address=None, relationship=None,
               category_id=None):
        if firstname is not None:
            self.firstname = encrypt(firstname)
        if lastname is not None:
            self.lastname = encrypt(lastname)
        if email is not None:
            self.email = encrypt(email)
        if phone is not None:
            self.phone = encrypt(phone)
        if address is not None:
            self.address = encrypt(address)
        if relationship is not None:
            self.relationship = encrypt(relationship)
        if category_id is not None:
            self.category_id = category_id  # No encryption needed for category_id

        db.session.commit()
    def to_dict(self):
        return {
            'id': self.id,
            'employee': self.employee.basic_details(),
            'firstname': decrypt(self.firstname),
            'lastname': decrypt(self.lastname),
            'email': decrypt(self.email),
            'phone': decrypt(self.phone),
            'category_id': self.category_id,
            'address': decrypt(self.address),
            'relationship': decrypt(self.relationship),
        }