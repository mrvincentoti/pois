from flask import Flask, request, jsonify
import os
import logging 

logging.basicConfig(level=logging.DEBUG)


from . import create_app  # from __init__ file
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import or_
import json

from . import create_app, db


app = create_app(os.getenv("CONFIG_MODE"))
app.config['TIMEZONE'] = 'Africa/Lagos'


@app.route('/')
def hello_world():
    configured_timezone = app.config.get('TIMEZONE')
    return configured_timezone

from .audit.models import Audit
from .audit import urls

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)