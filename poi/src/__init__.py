from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from datetime import timedelta

from .config import config

db = SQLAlchemy()
migrate = Migrate(compare_type=True)

def create_app(config_mode):
    app = Flask(__name__)
    # Enable debug mode
    app.config['DEBUG'] = True
    
    # Enable CORS for all routes
    CORS(app, resources={r"*": {"origins": "*"}})
    
    # Load configuration
    app.config.from_object(config[config_mode])
    
    # Configure session settings
    # Set secret key for session encryption
    app.secret_key = "20cedf91469b85930f7bf95d9b547cb2550dfc32a5f77209fac8bd3df980e859"
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=2)

    db.init_app(app)

    migrate.init_app(app, db)
    
    @app.before_request
    def make_session_permanent():
        session.permanent = True

    return app