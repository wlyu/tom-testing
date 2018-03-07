import unittest
from app.models import User
from app import create_app,db

class UserModekTestCase(unittest.TestCase):
    def test_password_setter(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        u = User(email='www@113.com22',password='cat22',confirmed=False)
        db.session.add(u)

        u = User(email='www@1132.com', password='cat2',confirmed=False)
        db.session.add(u)

        db.session.commit()
        self.assertTrue(u.password_hash is not None)

    def test_no_password_getter(self):
        u = User(password='cat')
        with self.assertRaises(AttributeError):
            u.password

    def test_password_verification(self):
        u = User(password='cat')
        self.assertTrue(u.verify_password('cat'))
        self.assertFalse(u.verify_password('dog'))

    def test_password_salts_are_random(self):
        u = User(password='cat')
        u2 = User(password='cat')
        print u
        self.assertTrue(u.password_hash != u2.password_hash)

