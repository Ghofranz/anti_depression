from dataclasses import dataclass

import firebase_admin
from firebase_admin import auth as firebase_auth
from django.conf import settings
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication, get_authorization_header

from .firebase_store import ensure_firebase_initialized


@dataclass
class FirebaseUser:
    uid: str
    username: str
    email: str
    name: str

    @property
    def id(self):
        return self.uid

    @property
    def is_authenticated(self):
        return True


class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = get_authorization_header(request).split()

        if not auth_header:
            return None

        if len(auth_header) != 2:
            raise exceptions.AuthenticationFailed('Invalid authorization header format.')

        scheme = auth_header[0].decode('utf-8').lower()
        if scheme not in ('bearer', 'token'):
            return None

        id_token = auth_header[1].decode('utf-8')

        try:
            ensure_firebase_initialized()
            decoded = firebase_auth.verify_id_token(id_token)
        except Exception as exc:
            raise exceptions.AuthenticationFailed(f'Invalid Firebase token: {exc}') from exc

        user = FirebaseUser(
            uid=decoded.get('uid', ''),
            username=decoded.get('name', decoded.get('email', '').split('@')[0]),
            email=decoded.get('email', ''),
            name=decoded.get('name', ''),
        )

        if not user.uid:
            raise exceptions.AuthenticationFailed('Invalid token payload.')

        return (user, id_token)
