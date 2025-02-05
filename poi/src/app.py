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
from .items.models import Item
from .crimes.models import Crime
from .arrestingBody.models import ArrestingBody
from .crimesCommitted.models import CrimeCommitted
from .activities.models import Activity
from .poiStatus.models import PoiStatus
from .feedback.models import Feedback


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
        State.create_seed_data()
        Lga.create_seed_data()
        Country.create_seed_data()
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
from .state import urls
from .religion import urls
from .rank import urls
from .lga import urls
from .gender import urls
from .designation import urls
from .department import urls
from .address import urls
from .dashboard import urls
from .country import urls
from .cadre import urls
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
from .items import urls
from .crimes import urls
from .arrestingBody import urls
from .crimesCommitted import urls
from .activities import urls
from .organisation import urls
from .orgMedia import urls
from .brief import urls
from .briefMedia import urls
from .orgActivities import urls
from .poiStatus import urls
from .activityItem import urls
from .operationalCapacity import urls
from .feedback import urls

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)