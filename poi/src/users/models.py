from .. import db  # from __init__.py
from datetime import datetime
from bcrypt import hashpw, gensalt, checkpw


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(256), unique=True, nullable=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_first_time = db.Column(db.Boolean, default=True)
    last_login_time = db.Column(db.DateTime, nullable=True)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    unit_id = db.Column(db.Integer, nullable=True, default=1)
    department_id = db.Column(db.Integer, nullable=True, default=1)
    directorate_id = db.Column(db.Integer, nullable=True, default=1)
    employee_id = db.Column(db.Integer, nullable=True)
    first_name = db.Column(db.String(128), unique=False, nullable=False)
    last_name = db.Column(db.String(128), unique=False, nullable=False)
    pfs_num = db.Column(db.String(128), unique=True, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    role = db.relationship("Role", backref="users")

    def __init__(
        self, email, username, password, role_id, unit_id, department_id, directorate_id, employee_id, first_name, last_name, pfs_num, is_active=True, is_first_time=True):
        self.email = email
        self.username = username
        self.set_password(password)
        self.is_active = is_active
        self.is_first_time = is_first_time
        self.role_id = role_id
        self.unit_id = unit_id
        self.department_id = department_id
        self.directorate_id = directorate_id
        self.employee_id= employee_id
        self.first_name = first_name
        self.last_name = last_name
        self.pfs_num = pfs_num

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def set_password(self, password):
        salt = gensalt()
        self.password = hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def check_password(self, password):
        return checkpw(password.encode("utf-8"), self.password.encode("utf-8"))

    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, username=None, role_id=None, unit_id=None, department_id=None, directorate_id=None, email=None, first_name=None, last_name=None, pfs_num=None, password=None):
        if username:
            self.username = username
        if first_name:
            self.first_name = first_name
        if last_name:
            self.last_name = last_name
        if pfs_num:
            self.pfs_num = pfs_num
        if role_id:
            self.role_id = role_id
        if unit_id:
            self.unit_id = unit_id
        if department_id:
            self.department_id = department_id
        if directorate_id:
            self.directorate_id = directorate_id
        if email:
            self.email = email
        db.session.commit()

    def to_dict(self):
        """
        Returns a dictionary representation of the User instance.
        """
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'is_active': self.is_active,
            'is_first_time': self.is_first_time,
            'last_login_time': self.last_login_time.strftime('%Y-%m-%d %H:%M:%S') if self.last_login_time else None,
            'role_id': self.role_id,
            'employee_id': self.employee_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'pfs_num': self.pfs_num,
            'deleted_at': self.deleted_at.strftime('%Y-%m-%d %H:%M:%S') if self.deleted_at else None,
            'role': self.role.name if self.role else None, 
            'unit_id': self.unit_id,
            'department_id': self.department_id,
            'directorate_id': self.directorate_id
        }

    def __repr__(self):
        return f"<User {self.username}>"

    @classmethod
    def create_seed_data(cls):
        # Sample data for users
        users_data = [
            {
                "email": "admin@eims.com",
                "username": "admin",
                "password": "1234",
                "role_id": 2,
                "unit_id": 1,
                "department_id": 1,
                "directorate_id": 1,
                "employee_id": None,
                "first_name": "Super",
                "last_name": "Admin",
                "pfs_num": "Super"
            },
            {
                "email": "user@eims.com",
                "username": "user",
                "password": "1234",
                "role_id": 1,
                "unit_id": 1,
                "department_id": 1,
                "directorate_id": 1,
                "employee_id": None,
                "first_name": "User",
                "last_name": "User",
                "pfs_num": "User"
            }
        ]

        for user_data in users_data:
            # Check if the user with the specified username already exists
            existing_user = cls.query.filter(
                (cls.username == user_data["username"])
                | (cls.email == user_data["email"])
            ).first()

            if existing_user is None:
                new_user = cls(**user_data)
                db.session.add(new_user)

        # Commit the changes to the database
        db.session.commit()
