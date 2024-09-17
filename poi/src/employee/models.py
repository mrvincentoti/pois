from datetime import datetime

from sqlalchemy import func
from sqlalchemy.ext.hybrid import hybrid_property

from .. import db  # from __init__.py
from ..util import decrypt, encrypt


from .. import db # from __init__.py
from ..util import encrypt, decrypt
class Employee(db.Model):
    __tablename__ = 'employee'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.Text, nullable=False)
    last_name = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, nullable=True)
    middle_name = db.Column(db.Text)
    pf_num = db.Column(db.Text, unique=False, nullable=True)
    dob = db.Column(db.Text, nullable=False)
    date_of_appointment = db.Column(db.Text, nullable=True)
    date_of_employment = db.Column(db.Text)
    last_promotion_date = db.Column(db.Text)
    retired = db.Column(db.Text, default="0")  # Since db.Text, store numbers as strings
    employment_status = db.Column(db.Integer, default=0)  # Since db.Text, store numbers as strings
    date_of_retirement = db.Column(db.Text, nullable=True)
    marital_status = db.Column(db.Text, nullable=True)
    home_town = db.Column(db.Text, nullable=True)
    residential_address = db.Column(db.Text)
    phone = db.Column(db.Text, nullable=True)
    passport_official = db.Column(db.Text, nullable=True)
    passport_personal = db.Column(db.Text, nullable=True)
    passport_diplomatic = db.Column(db.Text, nullable=True)
    photo = db.Column(db.Text(length=200000000))
    grade_on_app = db.Column(db.Text, nullable=True)
    year_of_grad = db.Column(db.Text)
    confirmation_of_app = db.Column(db.Text)
    qualification = db.Column(db.Text)
    category = db.Column(db.Text, nullable=True)
    stagnation = db.Column(db.Integer, default=0)
    language_spoken = db.Column(db.Text(2000), nullable=True)
    # Since db.Text, store numbers as strings

    gender_id = db.Column(db.Integer, db.ForeignKey('genders.id'))
    state_id = db.Column(db.Integer, db.ForeignKey('state.id'))
    lga_id = db.Column(db.Integer, db.ForeignKey('lga.id'))
    directorate_id = db.Column(db.Integer, db.ForeignKey('directorate.id'))
    cadre_id = db.Column(db.Integer, db.ForeignKey('cadre.id'))
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'))
    unit_id = db.Column(db.Integer, db.ForeignKey('unit.id'))
    religion_id = db.Column(db.Integer, db.ForeignKey('religions.id'))
    rank_id = db.Column(db.Integer, db.ForeignKey('rank.id'))
    designation_id = db.Column(db.Integer, db.ForeignKey('designation.id'))
    specialty_id = db.Column(db.Integer, db.ForeignKey('specialty.id'))

    gender = db.relationship("Gender", backref="employee")
    state = db.relationship("State", backref="employee")
    lga = db.relationship("Lga", backref="employee")
    directorate = db.relationship('Directorate', backref="employee")
    cadre = db.relationship('Cadre', backref="employee")
    department = db.relationship('Department', backref="employee")
    unit = db.relationship('Unit', backref="employee")
    religion = db.relationship('Religion', backref="employee")
    rank = db.relationship('Rank', backref="employee")
    designation = db.relationship('Designation', backref="employee")
    specialty = db.relationship('Specialty', backref="employee")

    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, first_name, last_name, pf_num, dob, date_of_appointment, last_promotion_date, photo, marital_status,
                 home_town, residential_address, date_of_employment=None, date_of_retirement=None,
                 middle_name=None, gender_id=None, state_id=None, lga_id=None, directorate_id=None, cadre_id=None,
                 department_id=None, unit_id=None, religion_id=None, rank_id=None, designation_id=None,
                 specialty_id=None, email=None, phone=None, passport_official=None, passport_personal=None, passport_diplomatic=None,
                 category=None, grade_on_app=None, year_of_grad=None, confirmation_of_app=None, qualification=None, stagnation=None, language_spoken=None, employment_status=None):
        self.first_name = encrypt(first_name)
        self.last_name = encrypt(last_name)
        self.middle_name = encrypt(middle_name)
        self.pf_num = encrypt(pf_num)
        self.dob = encrypt(dob)
        self.date_of_appointment = encrypt(date_of_appointment)
        self.last_promotion_date = encrypt(last_promotion_date)
        self.photo = encrypt(photo)
        self.marital_status = encrypt(marital_status)
        self.home_town = encrypt(home_town)
        self.residential_address = encrypt(residential_address)
        self.passport_official = encrypt(passport_official)
        self.passport_personal = encrypt(passport_personal)
        self.passport_diplomatic = encrypt(passport_diplomatic)
        self.date_of_employment = encrypt(date_of_employment)
        self.date_of_retirement = encrypt(date_of_retirement)
        self.gender_id = gender_id
        self.state_id = state_id
        self.lga_id = lga_id
        self.directorate_id = directorate_id
        self.department_id = department_id
        self.unit_id = unit_id
        self.religion_id = religion_id
        self.rank_id = rank_id
        self.designation_id = designation_id
        self.specialty_id = specialty_id
        self.cadre_id = cadre_id
        self.email = encrypt(email)
        self.phone = encrypt(phone)
        self.category = encrypt(category)
        self.grade_on_app = encrypt(grade_on_app)
        self.year_of_grad = encrypt(year_of_grad)
        self.confirmation_of_app = encrypt(confirmation_of_app)
        self.qualification = encrypt(qualification)
        self.stagnation = encrypt(stagnation)
        self.language_spoken = encrypt(language_spoken)
        self.employment_status = encrypt(employment_status)
        

    @hybrid_property
    def years_in_service(self):
        # Calculate the difference in years
        years_difference = datetime.now().year - self.date_of_appointment.year
        return years_difference

    @years_in_service.expression
    def years_in_service(cls):
        # This part is for SQLAlchemy to use the expression in queries
        return func.extract('year', func.current_date()) - func.extract('year', cls.date_of_appointment)

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None
        
    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self, first_name, last_name, pf_num, dob, date_of_appointment, last_promotion_date, photo, marital_status,
               home_town, residential_address, date_of_employment=None, date_of_retirement=None,
               middle_name=None, gender_id=None, state_id=None, lga_id=None, directorate_id=None, cadre_id=None,
               department_id=None, unit_id=None, religion_id=None, rank_id=None, designation_id=None,
               specialty_id=None, email=None, phone=None, passport_official=None, passport_personal=None, passport_diplomatic=None,
               category=None, grade_on_app=None, year_of_grad=None, confirmation_of_app=None, qualification=None, stagnation=None, language_spoken=None, employment_status=None):
        if first_name:
            self.first_name = encrypt(first_name)
        if last_name:
            self.last_name = encrypt(last_name)
        if pf_num:
            self.pf_num = encrypt(pf_num)
        if dob:
            self.dob = encrypt(dob)
        if date_of_appointment:
            self.date_of_appointment = encrypt(date_of_appointment)
        if last_promotion_date:
            self.last_promotion_date = encrypt(last_promotion_date)
        if photo:
            self.photo = encrypt(photo)
        if marital_status:
            self.marital_status = encrypt(marital_status)
        if home_town:
            self.home_town = encrypt(home_town)
        if residential_address:
            self.residential_address = encrypt(residential_address)
        if date_of_employment:
            self.date_of_employment = encrypt(date_of_employment)
        if date_of_retirement:
            self.date_of_retirement = encrypt(date_of_retirement)
        if middle_name:
            self.middle_name = encrypt(middle_name)
        if gender_id:
            self.gender_id = encrypt(gender_id)
        if state_id:
            self.state_id = encrypt(state_id)
        if lga_id:
            self.lga_id = encrypt(lga_id)
        if directorate_id:
            self.directorate_id = encrypt(directorate_id)
        if cadre_id:
            self.cadre_id = encrypt(cadre_id)
        if department_id:
            self.department_id = encrypt(department_id)
        if unit_id:
            self.unit_id = encrypt(unit_id)
        if religion_id:
            self.religion_id = encrypt(religion_id)
        if rank_id:
            self.rank_id = encrypt(rank_id)
        if designation_id:
            self.designation_id = encrypt(designation_id)
        if specialty_id:
            self.specialty_id = encrypt(specialty_id)
        if email:
            self.email = encrypt(email)
        if phone:
            self.phone = encrypt(phone)
        if passport_official:
            self.passport_official = encrypt(passport_official)
        if passport_personal:
            self.passport_personal = encrypt(passport_personal)
        if passport_diplomatic:
            self.passport_diplomatic = encrypt(passport_diplomatic)
        if category:
            self.category = encrypt(category)
        if grade_on_app:
            self.grade_on_app = encrypt(grade_on_app)
        if year_of_grad:
            self.year_of_grad = encrypt(year_of_grad)
        if confirmation_of_app:
            self.confirmation_of_app = encrypt(confirmation_of_app)
        if qualification:
            self.qualification = encrypt(qualification)
        if stagnation:
            self.stagnation = encrypt(stagnation)
        if language_spoken:
            self.language_spoken = encrypt(language_spoken)
        if employment_status:
            self.employment_status = encrypt(employment_status)
        db.session.commit()

    def basic_details(self):
        return {
            'id': self.id,
            'first_name': decrypt(self.first_name),
            'last_name': decrypt(self.last_name),
            'middle_name': decrypt(self.middle_name),
            'email': decrypt(self.pf_num) + '@demo.com',
            'pf_num': decrypt(self.pf_num),
            'dob': decrypt(self.dob),
            'photo': decrypt(self.photo),
        }

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': decrypt(self.first_name),
            'last_name': decrypt(self.last_name),
            'middle_name': decrypt(self.middle_name),
            'email': decrypt(self.pf_num) + '@demo.com',
            'pf_num': decrypt(self.pf_num),
            'dob': decrypt(self.dob),
            'date_of_appointment': decrypt(self.date_of_appointment),
            'last_promotion_date': decrypt(self.last_promotion_date),
            'photo': decrypt(self.photo),
            'marital_status': decrypt(self.marital_status),
            'home_town': decrypt(self.home_town),
            'residential_address': decrypt(self.residential_address),
            'passport_official': decrypt(self.passport_official),
            'passport_personal': decrypt(self.passport_personal),
            'passport_diplomatic': decrypt(self.passport_diplomatic),
            'date_of_employment': decrypt(self.date_of_employment),
            'date_of_retirement': decrypt(self.date_of_retirement),
            'gender': self.gender.to_dict() if self.gender else None,
            'state': self.state.to_dict() if self.state else None,
            'lga': self.lga.to_dict() if self.lga else None,
            'directorate': self.directorate.to_dict() if self.directorate else None,
            'cadre': self.cadre.to_dict() if self.cadre else None,
            'department': self.department.to_dict() if self.department else None,
            'unit': self.unit.to_dict() if self.unit else None,
            'religion': self.religion.to_dict() if self.religion else None,
            'rank': self.rank.to_dict() if self.rank else None,
            'designation': self.designation.to_dict() if self.designation else None,
            'specialty': self.specialty.to_dict() if self.specialty else None,
            'phone': decrypt(self.phone),
            'category': decrypt(self.category),
            'employment_status': self.employment_status,
            'grade_on_app': decrypt(self.grade_on_app),
            'language_spoken': decrypt(self.language_spoken)
        }




        
    def __repr__(self):
        return f'<Employee {self.name}>'
        

