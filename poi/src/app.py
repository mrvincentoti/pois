import os

from flask import request, Flask, jsonify

from . import create_app  # from __init__ file
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import or_
import json
from . import util


from .gender.models import Gender
from .religion.models import Religion
from .state.models import State
from .lga.models import Lga
from .country.models import Country
from .region.models import Region
from .station.models import Station
from .implication.models import Implication
from .cadre.models import Cadre
from .rank.models import Rank

from .users.models import User
from .roles.models import Role
from .modules.models import Module
from .permissions.models import Permission
from .category.models import Category
from .source.models import Source
from .poi.models import Poi
from .poiMedia.models import PoiMedia
from .affiliation.models import Affiliation
from .arms.models import Arm
from .armsRecovered.models import ArmsRecovered
from .crimes.models import Crime
from .arrestingBody.models import ArrestingBody
from .crimesCommitted.models import CrimeCommitted
from .activities.models import Activity
from .poiStatus.models import PoiStatus


from . import create_app, db


app = create_app(os.getenv("CONFIG_MODE"))
app.config['TIMEZONE'] = 'Africa/Lagos'

@app.route('/')
def hello_world():
    configured_timezone = app.config.get('TIMEZONE')
    return configured_timezone

@app.route("/seed", methods=['GET'])
def seed_users_data():
    permissions_file_path = os.path.join(os.path.dirname(__file__), 'permissions/data.json')
    if request.method == 'GET':
        Gender.create_seed_data()
        Religion.create_seed_data()
        State.create_seed_data()
        Lga.create_seed_data()
        Country.create_seed_data()
        Region.create_seed_data()
        Station.create_seed_data()
        Implication.create_seed_data()
        Role.create_seed_data()
        User.create_seed_data()
        Module.create_seed_data()
        Permission.create_seed_data(permissions_file_path)
        PoiStatus.create_seed_data()
        db.session.commit()
        return jsonify({'message': 'Data seeded successfully'}), 200
    else:
        return 'Method is Not Allowed'

from .directorate import urls
from .unit import urls
from .training import urls
from .state import urls
from .specialty import urls
from .sanction import urls
from .religion import urls
from .rank import urls
from .nok import urls
from .lga import urls
from .gender import urls
from .employee import urls
from .designation import urls
from .deployment import urls
from .department import urls
from .contact import urls
from .conference import urls
from .address import urls
from .dashboard import urls
from .country import urls
from .region import urls
from .station import urls
from .cadre import urls
from .employeePosting import urls
from .implication import urls
from .users import urls
from .roles import urls
from .permissions import urls
from .rolePermissions import urls
from .audit import urls
from .category import urls
from .source import urls
from .poi import urls
from .poiMedia import urls
from .modules import urls
from .affiliation import urls
from .arms import urls
from .armsRecovered import urls
from .crimes import urls
from .arrestingBody import urls
from .crimesCommitted import urls
from .activities import urls
from .organisation import urls
from .orgMedia import urls
from .brief import urls
from .briefMedia import urls
from .OrgActivities import urls
from .poiStatus import urls
from .activityItem import urls

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)