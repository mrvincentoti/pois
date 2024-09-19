from .. import db  # from __init__.py


class State(db.Model):
    __tablename__ = "state"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text(5000))


    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }

    @classmethod
    def create_seed_data(cls):
        # Sample data for states
        states_data = [
            {"id": "1", "name": "Abia"},
            {"id": "2", "name": "Adamawa"},
            {"id": "3", "name": "Akwa Ibom"},
            {"id": "4", "name": "Anambra"},
            {"id": "5", "name": "Bauchi"},
            {"id": "6", "name": "Bayelsa"},
            {"id": "7", "name": "Benue"},
            {"id": "8", "name": "Borno"},
            {"id": "9", "name": "Cross River"},
            {"id": "10", "name": "Delta"},
            {"id": "11", "name": "Ebonyi"},
            {"id": "12", "name": "Edo"},
            {"id": "13", "name": "Ekiti"},
            {"id": "14", "name": "Enugu"},
            {"id": "15", "name": "Gombe"},
            {"id": "16", "name": "Imo"},
            {"id": "17", "name": "Jigawa"},
            {"id": "18", "name": "Kaduna"},
            {"id": "19", "name": "Kano"},
            {"id": "20", "name": "Katsina"},
            {"id": "21", "name": "Kebbi"},
            {"id": "22", "name": "Kogi"},
            {"id": "23", "name": "Kwara"},
            {"id": "24", "name": "Lagos"},
            {"id": "25", "name": "Nasarawa"},
            {"id": "26", "name": "Niger"},
            {"id": "27", "name": "Ogun"},
            {"id": "28", "name": "Ondo"},
            {"id": "29", "name": "Osun"},
            {"id": "30", "name": "Oyo"},
            {"id": "31", "name": "Plateau"},
            {"id": "32", "name": "Rivers"},
            {"id": "33", "name": "Sokoto"},
            {"id": "34", "name": "Taraba"},
            {"id": "35", "name": "Yobe"},
            {"id": "36", "name": "Zamfara"},
            {"id": "37", "name": "FCT Abuja"},
        ]

        # Loop through the sample data and add to the database
        for state_data in states_data:
            # Check if the state with the specified id already exists
            existing_state = cls.query.filter_by(id=state_data['id']).first()

            if existing_state is None:
                new_state = cls(**state_data)
                db.session.add(new_state)

        # Commit the changes to the database
        db.session.commit()

    def __init__(self, id, name):
        self.id = id
        self.name = name
