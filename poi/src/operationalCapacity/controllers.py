from flask import request, jsonify, json, g
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from .. import db
from ..arms.models import Arm
from ..poi.models import Poi
from ..users.models import User
from ..util import custom_jwt_required, save_audit_data
from .models import OperationalCapacity

def slugify(text):
    return text.replace(' ', '-').lower()

