import os

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    # Define the upload folder path (relative to the current file's directory)
    POI_MEDIA_UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "poiMedia", "storage", "media")

class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("EMPLOYEE_DEVELOPMENT_DATABASE_URL")

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv("EMPLOYEE_TEST_DATABASE_URL")

class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("EMPLOYEE_STAGING_DATABASE_URL")

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("EMPLOYEE_PRODUCTION_DATABASE_URL")

# Dictionary to easily access the different configurations
config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "staging": StagingConfig,
    "production": ProductionConfig
}