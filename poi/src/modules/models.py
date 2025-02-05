from sqlalchemy import inspect
from datetime import datetime
from .. import db  # from __init__.py


class Module(db.Model):
    __tablename__ = "modules"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, name, description):
        self.name = name
        self.description = description

    def __repr__(self):
        return f"<Module {self.name}>"

    def soft_delete(self):
        self.deleted_at = datetime.now()

    def restore(self):
        self.deleted_at = None
        
    @classmethod
    def create_seed_data(cls):
        # Sample data for modules
        modules_data = [
            {"name": "EOI Service", "description": "EOI Service"}
        ]

        # Loop through the sample data and add to the database
        for modules in modules_data:
            new_module = cls(**modules)
            db.session.add(new_module)

        # Commit the changes to the database
        db.session.commit()
