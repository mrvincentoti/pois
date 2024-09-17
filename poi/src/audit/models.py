from datetime import datetime
from .. import db
from ..util import decrypt, encrypt

class Audit(db.Model):
    __tablename__ = 'audit'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    user_email = db.Column(db.String(128))
    event = db.Column(db.String(128))
    auditable_id = db.Column(db.Integer)
    employee_id = db.Column(db.Integer)
    first_name = db.Column(db.String(128))
    last_name = db.Column(db.String(128))
    pfs_num = db.Column(db.String(128))
    old_values = db.Column(db.Text(length=200000000))
    new_values = db.Column(db.Text(length=200000000))
    url = db.Column(db.Text(length=20000))
    ip_address = db.Column(db.String(128))
    user_agent = db.Column(db.Text(length=200000000))
    tags = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_email': decrypt(self.user_email),
            'event': decrypt(self.event),
            'auditable_id': self.auditable_id,
            'employee_id': self.employee_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'pfs_num': self.pfs_num,
            'old_values': decrypt(self.old_values),
            'new_values': decrypt(self.new_values),
            'url': decrypt(self.url),
            'ip_address': decrypt(self.ip_address),
            'user_agent': decrypt(self.user_agent),
            'tags': decrypt(self.tags),
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    def __repr__(self):
        return f'<Audit {self.event} by User ID: {self.user_id}>'
