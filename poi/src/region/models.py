from .. import db  # from __init__.py
from ..util import encrypt, decrypt


class Region(db.Model):
    __tablename__ = "region"
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.Text(500))
    name = db.Column(db.Text(5000))
    
    @classmethod
    def create_seed_data(cls):
        regions_data = [
            {"id": "1", "code": "WAI", "name": "WEST AFRICA I"},
            {"id": "2", "code": "WAII", "name": "WEST AFRICA II"},
            {"id": "3", "code": "NAME", "name": "NORTH AFRICA AND MIDDLE EAST"},
            {"id": "4", "code": "ECAF", "name": "EAST AND CENTRAL AFRICA"},
            {"id": "5", "code": "SA", "name": "SOUTHERN AFRICA"},
            {"id": "6", "code": "AMS", "name": "AMERICAS"},
            {"id": "7", "code": "EURI", "name": "EUROPE I"},
            {"id": "8", "code": "EURII", "name": "EUROPE II"},
            {"id": "9", "code": "AFE", "name": "ASIA FAR EAST"},
            {"id": "10", "code": "INTAG", "name": "INTERNATIONAL AGENCIES"}
        ]
        
        for region_data in regions_data:
            existing_region = cls.query.filter_by(id=region_data['id']).first()

            if existing_region is None:
                new_region = cls(**region_data)
                db.session.add(new_region)

        db.session.commit()

    def __init__(self, id, code, name):
        self.id = id
        self.code = encrypt(code)
        self.name = encrypt(name)

    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name),
            'code': decrypt(self.code),
        }