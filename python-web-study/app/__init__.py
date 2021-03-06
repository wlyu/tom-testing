# coding:utf-8
from flask import Flask, render_template
from flask_bootstrap import Bootstrap
from flask_moment import Moment
from flask_sqlalchemy import SQLAlchemy
from flask_script import Manager
from config import config

from flask_mail import Mail
# for login
from flask_login import LoginManager

bootstrap = Bootstrap()
moment = Moment()
db = SQLAlchemy()
mail = Mail()
# 初始化Flask-Login
loginManager = LoginManager()
loginManager.session_protection = 'strong'
loginManager.login_view = 'auth.login'




def create_app(config_name):
    app = Flask(__name__)

    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    bootstrap.init_app(app)
    moment.init_app(app)
    db.init_app(app)
    mail.init_app(app)

    ##注册蓝本
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    ##
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/auth')

    loginManager.init_app(app)

    return app


