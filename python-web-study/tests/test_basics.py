#coding:utf-8
import unittest
from flask import current_app
from app import create_app, db
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer


class BasicTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        # db.create_all()

    def tearDown(self):
        # db.session.remove()
        # db.drop_all()
        self.app_context.pop()

    def test_app_exists(self):
        self.assertFalse(create_app is None)

    def test_serialize(self):

        s = Serializer(self.app.config['SECRET_KEY'], expires_in=3600)
        token = s.dumps({'confirm': 23})
        print token
        data = s.loads(token)
        print data
