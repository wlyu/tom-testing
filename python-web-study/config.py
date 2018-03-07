import os
basedir=os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or '1234567#@!.'
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    FLASKY_ADMIN = os.environ.get('FLASKY_ADMIN')

    MAIL_SERVER = 'smtp.qq.com'
    MAIL_PORT = '465'
    MAIL_USE_SSL = True
    MAIL_USERNAME = '850352370'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or '123456'
    FLASKY_MAIL_SENDER =  '850352370@qq.com'
    FLASKY_MAIL_SUBJECT_PREFIX = '[Flasky_EMail]'


    @staticmethod
    def init_app(app):
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

        pass

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
                              'mysql+pymysql://root:123456@localhost:3306/py?charset=utf8'


class TestingConfig(Config):
     TESTING = True
     SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
                               'mysql+pymysql://root:123456@localhost:3306/py?charset=utf8'


class ProductionConfig(Config):
     SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                               'mysql://root:123456@localhost:3306/py?charset=utf8'


config = {
     'development': DevelopmentConfig,
     'testing': TestingConfig,
     'production': ProductionConfig,
     'default': DevelopmentConfig
}
