from datetime import datetime

from .. import db  # from __init__.py
from ..util import encrypt, decrypt


class Station(db.Model):
    __tablename__ = "station"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text(20000))
    region_id = db.Column(db.Integer, db.ForeignKey('region.id'))
    country_id = db.Column(db.Integer, db.ForeignKey('country.id'))
    region = db.relationship('Region')
    country = db.relationship('Country')
    deleted_at = db.Column(db.DateTime, nullable=True)


    def soft_delete(self):
        self.deleted_at = datetime.now()
    def to_dict(self):
        return {
            'id': self.id,
            'name': decrypt(self.name),
            'region_id': self.region_id,
            'country': self.country.to_dict(),
            'deleted_at': self.deleted_at
        }

    @classmethod
    def create_seed_data(cls):
        stations_data = [
            {"id": "1", "name": "COTONOU II", "region_id":"1", "country_id":"59"},
            {"id": "2", "name": "MALABO", "region_id":"1", "country_id":"65"},
            {"id": "3", "name": "COTONOU I", "region_id":"1", "country_id":"59"},
            {"id": "4", "name": "BUEA", "region_id":"1", "country_id":"36"},
            {"id": "5", "name": "NDJAMENA I", "region_id":"1", "country_id":"42"},
            {"id": "6", "name": "DOUALA", "region_id":"1", "country_id":"36"},
            {"id": "7", "name": "LOME", "region_id":"1", "country_id":"221"},
            {"id": "8", "name": "STP", "region_id":"1", "country_id":"196"},
            {"id": "9", "name": "NIAMEY II", "region_id":"1", "country_id":"160"},
            {"id": "10", "name": "OUAGADOUGOU I", "region_id":"1", "country_id":"242"},
            {"id": "11", "name": "NDJAMENA II", "region_id":"1", "country_id":"42"},
            {"id": "12", "name": "BATA", "region_id":"1", "country_id":"65"},
            {"id": "13", "name": "YAOUNDE", "region_id":"1", "country_id":"36"},
            {"id": "14", "name": "BAMAKO", "region_id":"1", "country_id":"134"},
            {"id": "15", "name": "NDJAMENA III", "region_id":"1", "country_id":"42"},
            {"id": "16", "name": "OUAGADOUGOU II", "region_id":"1", "country_id":"242"},


            {"id": "17", "name": "ABIDJAN I", "region_id":"2", "country_id":"110"},
            {"id": "18", "name": "ABIDJAN 2", "region_id":"2", "country_id":"110"},
            {"id": "19", "name": "ABIDJAN 3", "region_id":"2", "country_id":"110"},
            {"id": "20", "name": "ACCRA 1", "region_id":"2", "country_id":"85"},
            {"id": "21", "name": "ACCRA 2", "region_id":"2", "country_id":"85"},
            {"id": "22", "name": "BANJUL", "region_id":"2", "country_id":"82"},
            {"id": "23", "name": "BISSAU", "region_id":"2", "country_id":"179"},
            {"id": "24", "name": "CONAKRY", "region_id":"2", "country_id":"94"},
            {"id": "25", "name": "DAKAR 1", "region_id":"2", "country_id":"198"},
            {"id": "26", "name": "DAKAR 2", "region_id":"2", "country_id":"198"},
            {"id": "27", "name": "FREETOWN", "region_id":"2", "country_id":"201"},
            {"id": "28", "name": "MONROVIA", "region_id":"2", "country_id":"124"},


            {"id": "29", "name": "ALGIERS", "region_id":"3", "country_id":"4"},
            {"id": "30", "name": "RIYADH", "region_id":"3", "country_id":"197"},
            {"id": "31", "name": "JEDDAH I", "region_id":"3", "country_id":"197"},
            {"id": "32", "name": "TEHRAN", "region_id":"3", "country_id":"105"},
            {"id": "33", "name": "DUBAI I", "region_id":"3", "country_id":"225"},
            {"id": "34", "name": "ABU DHABI", "region_id":"3", "country_id":"225"},
            {"id": "35", "name": "DUBAI II", "region_id":"3", "country_id":"225"},
            {"id": "36", "name": "BEIRUT", "region_id":"3", "country_id":"121"},
            {"id": "37", "name": "JUBA", "region_id":"3", "country_id":"210"},
            {"id": "38", "name": "TRIPOLI II", "region_id":"3", "country_id":"125"},
            {"id": "39", "name": "TUNIS", "region_id":"3", "country_id":"226"},
            {"id": "40", "name": "RABAT", "region_id":"3", "country_id":"145"},
            {"id": "41", "name": "DOHA", "region_id":"3", "country_id":"182"},
            {"id": "42", "name": "CAIRO I", "region_id":"3", "country_id":"234"},
            {"id": "43", "name": "CAIRO II", "region_id":"3", "country_id":"234"},
            {"id": "44", "name": "JEDDAH II", "region_id":"3", "country_id":"197"},
            {"id": "45", "name": "AMMAN", "region_id":"3", "country_id":"114"},
            {"id": "46", "name": "KHARTOUM", "region_id":"3", "country_id":"211"},
            {"id": "47", "name": "DUBAI II", "region_id":"3", "country_id":"225"},
            {"id": "48", "name": "TEL AVIV", "region_id":"3", "country_id":"108"},
            {"id": "49", "name": "TRIPOLI I", "region_id":"3", "country_id":"125"},
            {"id": "50", "name": "BEIRUT", "region_id":"3", "country_id":"121"},


            {"id": "51", "name": "DAR ES SALAAM", "region_id":"4", "country_id":"239"},
            {"id": "52", "name": "LIBREVILLE", "region_id":"4", "country_id":"80"},
            {"id": "53", "name": "BANGUI", "region_id":"4", "country_id":"40"},
            {"id": "54", "name": "KINSHASA", "region_id":"4", "country_id":"52"},
            {"id": "55", "name": "KIGALI", "region_id":"4", "country_id":"186"},
            {"id": "56", "name": "NAIROBI I", "region_id":"4", "country_id":"115"},
            {"id": "57", "name": "KAMPALA", "region_id":"4", "country_id":"231"},
            {"id": "58", "name": "BUJUMBURA", "region_id":"4", "country_id":"33"},
            {"id": "59", "name": "LUSAKA", "region_id":"4", "country_id":"249"},
            {"id": "60", "name": "BRAZZAVILLE", "region_id":"4", "country_id":"51"},
            {"id": "61", "name": "LUANDA", "region_id":"4", "country_id":"7"},


            {"id": "62", "name": "JOHANESBURG-I", "region_id":"5", "country_id":"207"},
            {"id": "63", "name": "JOHANESBURG-II", "region_id":"5", "country_id":"207"},
            {"id": "64", "name": "PRETORIA", "region_id":"5", "country_id":"207"},
            {"id": "65", "name": "HARARE", "region_id":"5", "country_id":"208"},
            {"id": "66", "name": "MAPUTO", "region_id":"5", "country_id":"146"},
            {"id": "67", "name": "WINDHOEK", "region_id":"5", "country_id":"148"},


            {"id": "68", "name": "ATLANTA", "region_id":"6", "country_id":"240"},
            {"id": "69", "name": "NEW YORK 1", "region_id":"6", "country_id":"240"},
            {"id": "70", "name": "MEXICO CITY", "region_id":"6", "country_id":"139"},
            {"id": "71", "name": "WASHINGTON 1", "region_id":"6", "country_id":"240"},
            {"id": "72", "name": "WASHINGTON 3", "region_id":"6", "country_id":"240"},
            {"id": "73", "name": "OTTAWA 1", "region_id":"6", "country_id":"37"},
            {"id": "74", "name": "BRASILIA", "region_id":"6", "country_id":"25"},
            {"id": "75", "name": "WASHINGTON 2", "region_id":"6", "country_id":"240"},
            {"id": "76", "name": "NEW YORK 2", "region_id":"6", "country_id":"240"},
            {"id": "77", "name": "BUENOS AIRES", "region_id":"6", "country_id":"10"},
            {"id": "78", "name": "KINGSTON", "region_id":"6", "country_id":"111"},
            {"id": "79", "name": "CARACAS", "region_id":"6", "country_id":"245"},
            {"id": "80", "name": "PORT OF SPAIN", "region_id":"6", "country_id":"224"},
            {"id": "81", "name": "OTTAWA 2", "region_id":"6", "country_id":"37"},


            {"id": "82", "name": "MADRID", "region_id":"7", "country_id":"209"},
            {"id": "83", "name": "HAGUE II", "region_id":"7", "country_id":"151"},
            {"id": "84", "name": "BERNE", "region_id":"7", "country_id":"215"},
            {"id": "85", "name": "PARIS I", "region_id":"7", "country_id":"75"},
            {"id": "86", "name": "LONDON I", "region_id":"7", "country_id":"235"},
            {"id": "87", "name": "HAGUE I", "region_id":"7", "country_id":"151"},
            {"id": "88", "name": "ROME I", "region_id":"7", "country_id":"109"},
            {"id": "89", "name": "DUBLIN", "region_id":"7", "country_id":"107"},
            {"id": "90", "name": "BERLIN II", "region_id":"7", "country_id":"84"},
            {"id": "91", "name": "LONDON III", "region_id":"7", "country_id":"235"},
            {"id": "92", "name": "PARIS II", "region_id":"7", "country_id":"75"},
            {"id": "93", "name": "LONDON II", "region_id":"7", "country_id":"235"},
            {"id": "94", "name": "FRANKFURT", "region_id":"7", "country_id":"84"},
            {"id": "95", "name": "ROME II", "region_id":"7", "country_id":"109"},
            {"id": "96", "name": "LISBON", "region_id":"7", "country_id":"178"},


            {"id": "97", "name": "BUCHAREST", "region_id":"8", "country_id":"184"},
            {"id": "98", "name": "MOSCOW", "region_id":"8", "country_id":"185"},
            {"id": "99", "name": "KIEV", "region_id":"8", "country_id":"127"},
            {"id": "100", "name": "STOCHOLM II", "region_id":"8", "country_id":"216"},
            {"id": "101", "name": "ANKARA", "region_id":"8", "country_id":"227"},
            {"id": "102", "name": "ATHENS", "region_id":"8", "country_id":"88"},
            {"id": "103", "name": "STOCKHOLM I", "region_id":"8", "country_id":"216"},
            {"id": "104", "name": "BUDAPEST", "region_id":"8", "country_id":"101"},
            {"id": "105", "name": "WARSAW", "region_id":"8", "country_id":"177"},

            {"id": "106", "name": "SINGAPORE", "region_id":"9", "country_id":"202"},
            {"id": "107", "name": "KUALA LUMPUR II", "region_id":"9", "country_id":"132"},
            {"id": "108", "name": "JAKARTA", "region_id":"9", "country_id":"104"},
            {"id": "109", "name": "BEIJING", "region_id":"9", "country_id":"44"},
            {"id": "110", "name": "SHANGHAI", "region_id":"9", "country_id":"44"},
            {"id": "111", "name": "NEW DELHI I", "region_id":"9", "country_id":"103"},
            {"id": "112", "name": "TOKYO", "region_id":"9", "country_id":"112"},
            {"id": "113", "name": "CANBERRA", "region_id":"9", "country_id":"11"},
            {"id": "114", "name": "MANILA", "region_id":"9", "country_id":"175"},
            {"id": "115", "name": "KUALA LUMPUR I", "region_id":"9", "country_id":"132"},
            {"id": "116", "name": "HONG-KONG", "region_id":"9", "country_id":"44"},
            {"id": "117", "name": "GUANGZHOU I", "region_id":"9", "country_id":"44"},
            {"id": "118", "name": "HANOI", "region_id":"9", "country_id":"204"},
            {"id": "119", "name": "BANGKOK", "region_id":"9", "country_id":"220"},


            {"id": "120", "name": "BRUSSELS", "region_id":"10", "country_id":"18"},
            {"id": "121", "name": "NYPM 1222", "region_id":"10", "country_id":"240"},
            {"id": "122", "name": "GENEVA 1", "region_id":"10", "country_id":"217"},
            {"id": "123", "name": "ADDIS ABABA I", "region_id":"10", "country_id":"66"},
            {"id": "124", "name": "VIENNA 2", "region_id":"10", "country_id":"12"},
            {"id": "125", "name": "LCBC", "region_id":"10", "country_id":"42"},
            {"id": "126", "name": "NEW YORK 2", "region_id":"10", "country_id":"240"},
            {"id": "127", "name": "ADDIS ABABA II", "region_id":"10", "country_id":"66"},
            {"id": "128", "name": "GENEVA 2", "region_id":"10", "country_id":"217"},
            {"id": "129", "name": "UN-AU OFFICE", "region_id":"10", "country_id":"240"},

        ]
        
        for station_data in stations_data:
            existing_station = cls.query.filter_by(id=station_data['id']).first()

            if existing_station is None:
                new_station = cls(**station_data)
                db.session.add(new_station)

        db.session.commit()

    def __init__(self, id, name, region_id=None, country_id=None):
        self.id = id
        self.name = encrypt(name)
        self.region_id = region_id
        self.country_id = country_id