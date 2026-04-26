from types import SimpleNamespace

DEMO_USERS = {
    'alice': {
        'uid': 'uid-alice',
        'username': 'alice',
        'email': 'alice@whisperwall.local',
        'name': 'Alice Cooper',
        'password': 'password123',
    },
    'bob': {
        'uid': 'uid-bob',
        'username': 'bob',
        'email': 'bob@whisperwall.local',
        'name': 'Bob Stone',
        'password': 'password123',
    },
}

DEMO_CONFESSIONS = {
    'alice': {
        'id': 1,
        'text': 'I need help understanding Django REST authentication.',
        'emotion': 'course_help',
        'location_hint': 'Computer lab',
        'created_at': '2026-04-26T10:00:00Z',
        'likes': 0,
        'is_revealed': False,
        'author_uid': 'uid-alice',
        'author_username': 'alice',
    },
    'bob': {
        'id': 2,
        'text': 'I also need help with REST auth in my backend class.',
        'emotion': 'course_help',
        'location_hint': 'Computer lab',
        'created_at': '2026-04-26T10:05:00Z',
        'likes': 0,
        'is_revealed': False,
        'author_uid': 'uid-bob',
        'author_username': 'bob',
    },
}

DEMO_MATCH = {
    'id': 1,
    'confession_a_id': 1,
    'confession_b_id': 2,
    'score': 0.92,
    'created_at': '2026-04-26T10:10:00Z',
    'is_active': True,
}

DEMO_CHAT_MESSAGES = [
    {
        'id': 1,
        'match': 1,
        'sender': 1,
        'message': 'Hi, want to study together?',
        'timestamp': '2026-04-26T10:11:00Z',
    },
    {
        'id': 2,
        'match': 1,
        'sender': 2,
        'message': 'Yes, that would be great.',
        'timestamp': '2026-04-26T10:12:00Z',
    },
]

DEMO_REVEAL_STATUS = {
    'match_id': 1,
    'confession_a_accepted': True,
    'confession_b_accepted': False,
    'revealed': False,
}

DEMO_PROFILE = {
    'user_uid': 'uid-alice',
    'display_name': 'Alice Cooper',
    'academic_email': 'alice@whisperwall.local',
    'programme': 'Computer Science',
    'bio': 'Backend student',
    'created_at': '2026-04-26T10:15:00Z',
    'updated_at': '2026-04-26T10:15:00Z',
}

DEMO_EVENTS = {
    'events': [
        {
            'event_id': 1,
            'match_id': 1,
            'title': 'Start Talking',
            'type': 'chat',
            'plan': {'steps': ['Send first message', 'Icebreaker question']},
            'created_at': '2026-04-26T10:20:00Z',
        }
    ]
}


def firebase_user(uid: str, username: str, email: str, name: str, **_extra):
    return SimpleNamespace(
        uid=uid,
        username=username,
        email=email,
        name=name,
        is_authenticated=True,
    )
