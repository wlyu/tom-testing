# coding:utf-8
from flask import Flask
from flask_mail import Mail, Message
import os
class EmailTestCase():
    def test_init(self):
        print os.environ.get('MAIL_PASSWORD')
        app = Flask(__name__)
        app_context = app.app_context()
        app_context.push()
        app.config.update(
            MAIL_SERVER='smtp.qq.com',
            MAIL_PORT='465',
            MAIL_USE_SSL=True,
            MAIL_USERNAME='850352370',
            MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD') or '123456'
        )
        mail = Mail(app)
        msg = Message(subject="测试", sender='850352370@qq.com', recipients=['xxx@163.com'])
        msg.html = '<h1>hello world！</h1>'
        mail.send(msg)









