from sqlalchemy import inspect
from datetime import datetime
from bcrypt import hashpw, gensalt, checkpw

from .. import db # from __init__.py

class Account(db.Model):
    id           = db.Column(db.String(50), primary_key=True, nullable=False, unique=True)
    email        = db.Column(db.String(100), nullable=False, unique=True)
    username     = db.Column(db.String(100), nullable=False)
    password    = db.Column(db.String(60), nullable=False)  # Adjust the length as needed
    is_active = db.Column(db.Boolean, default=True)
    is_first_time = db.Column(db.Boolean, default=True)
    created      = db.Column(db.DateTime(timezone=True), default=datetime.now)                         
    updated      = db.Column(db.DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)    

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}

    def __repr__(self):
        return f"<Account {self.email}>"

    def set_password(self, password):
        salt = gensalt()
        self.password = hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        return checkpw(password.encode('utf-8'), self.password.encode('utf-8'))