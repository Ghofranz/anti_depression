from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from .test_seed import (
    DEMO_CHAT_MESSAGES,
    DEMO_CONFESSIONS,
    DEMO_EVENTS,
    DEMO_MATCH,
    DEMO_PROFILE,
    DEMO_REVEAL_STATUS,
    DEMO_USERS,
    firebase_user,
)


class FakeResponse:
    def __init__(self, payload, status_code=200):
        self._payload = payload
        self.status_code = status_code

    def json(self):
        return self._payload


class FirebaseFeatureTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.alice = firebase_user(**DEMO_USERS['alice'])
        self.bob = firebase_user(**DEMO_USERS['bob'])

    @patch('core.views._ensure_web_api_key', return_value=True)
    @patch('core.views.get_user_by_username')
    @patch('core.views.upsert_user_profile')
    @patch('core.views.requests.post')
    def test_signup_and_login(
        self,
        mock_post,
        mock_upsert_profile,
        mock_get_user_by_username,
        mock_ensure_web_api_key,
    ):
        mock_get_user_by_username.return_value = None
        mock_post.return_value = FakeResponse(
            {
                'localId': 'uid-alice',
                'idToken': 'token-alice',
                'email': DEMO_USERS['alice']['email'],
            },
            status_code=200,
        )

        signup_payload = {
            'username': DEMO_USERS['alice']['username'],
            'password': DEMO_USERS['alice']['password'],
            'email': DEMO_USERS['alice']['email'],
            'name': DEMO_USERS['alice']['name'],
        }
        response = self.client.post('/api/sign_up/', signup_payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['user']['username'], 'alice')
        self.assertEqual(response.data['token'], 'token-alice')
        mock_upsert_profile.assert_called_once()

        mock_get_user_by_username.return_value = {
            'username': 'alice',
            'email': DEMO_USERS['alice']['email'],
            'name': DEMO_USERS['alice']['name'],
        }
        mock_post.return_value = FakeResponse(
            {
                'localId': 'uid-alice',
                'idToken': 'token-alice-login',
                'email': DEMO_USERS['alice']['email'],
                'displayName': DEMO_USERS['alice']['name'],
            },
            status_code=200,
        )

        login_payload = {
            'username': DEMO_USERS['alice']['username'],
            'password': DEMO_USERS['alice']['password'],
        }
        response = self.client.post('/api/login/', login_payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['token'], 'token-alice-login')
        self.assertEqual(response.data['user']['username'], 'alice')
        mock_ensure_web_api_key.assert_called()

    @patch('core.views.create_confession', return_value=DEMO_CONFESSIONS['alice'])
    def test_create_and_list_confessions(self, mock_create_confession):
        self.client.force_authenticate(user=self.alice)

        create_payload = {
            'text': DEMO_CONFESSIONS['alice']['text'],
            'emotion': DEMO_CONFESSIONS['alice']['emotion'],
            'location_hint': DEMO_CONFESSIONS['alice']['location_hint'],
        }
        response = self.client.post('/api/confess/', create_payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['id'], 1)
        mock_create_confession.assert_called_once()

        with patch('core.views.list_confessions_by_author_uid', return_value=[DEMO_CONFESSIONS['alice']]):
            response = self.client.get('/api/confess/')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data), 1)

        with patch('core.views.get_all_confessions_store', return_value=list(DEMO_CONFESSIONS.values())):
            response = self.client.get('/api/confess/all/')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data), 2)

    @patch('core.views.get_matches_for_confession', return_value=[DEMO_MATCH])
    def test_match_and_chat_flow(self, mock_get_matches):
        self.client.force_authenticate(user=self.alice)

        response = self.client.get('/api/matches/1/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['id'], DEMO_MATCH['id'])
        mock_get_matches.assert_called_once_with(1)

        with patch('core.views.get_chat_messages', return_value=DEMO_CHAT_MESSAGES):
            response = self.client.get('/api/chat/1/')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data), 2)

        with patch('core.views.send_chat_message', return_value=DEMO_CHAT_MESSAGES[0]):
            response = self.client.post(
                '/api/chat/send/',
                {'match': 1, 'sender': 1, 'message': 'Hi, want to study together?'},
                format='json',
            )
            self.assertEqual(response.status_code, 201)
            self.assertEqual(response.data['message'], 'Hi, want to study together?')

    def test_reveal_and_contact_exchange_flow(self):
        self.client.force_authenticate(user=self.alice)

        with patch('core.views.do_request_reveal', return_value=(DEMO_REVEAL_STATUS, '', 200)):
            response = self.client.post('/api/reveal/', {'match': 1, 'confession': 1}, format='json')
            self.assertEqual(response.status_code, 200)
            self.assertFalse(response.data['revealed'])

        with patch('core.views.get_contact_exchange_status', return_value=(
            {
                'match': 1,
                'my_contact_exchange_active': True,
                'peer_contact_exchange_active': False,
                'both_active': False,
                'my_profile': DEMO_PROFILE,
                'peer_profile': None,
            },
            '',
            200,
        )):
            response = self.client.get('/api/contact-exchange/status/1/')
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.data['my_contact_exchange_active'])

        with patch('core.views.activate_contact_exchange', return_value=(
            {
                'message': 'Contact exchange activated',
                'my_contact_exchange_active': True,
                'peer_contact_exchange_active': True,
                'both_active': True,
                'my_profile': DEMO_PROFILE,
                'peer_profile': DEMO_PROFILE,
            },
            '',
            200,
        )):
            response = self.client.post('/api/contact-exchange/activate/1/', {}, format='json')
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.data['both_active'])

    def test_profile_and_events_flow(self):
        self.client.force_authenticate(user=self.alice)

        with patch('core.views.get_or_update_profile', return_value=(DEMO_PROFILE, '', 200)):
            response = self.client.get('/api/profile/me/')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data['display_name'], DEMO_PROFILE['display_name'])

        with patch('core.views.get_or_update_profile', return_value=(DEMO_PROFILE, '', 200)):
            response = self.client.post(
                '/api/profile/me/',
                {
                    'display_name': 'Alice Cooper',
                    'academic_email': 'alice@whisperwall.local',
                    'programme': 'Computer Science',
                    'bio': 'Backend student',
                },
                format='json',
            )
            self.assertEqual(response.status_code, 200)

        with patch('core.views.get_events_for_user', return_value=DEMO_EVENTS):
            response = self.client.get('/api/events/')
            self.assertEqual(response.status_code, 200)
            self.assertIn('events', response.data)
            self.assertEqual(response.data['events'][0]['event_id'], 1)
