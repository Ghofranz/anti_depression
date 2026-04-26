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
            'room_id': 'night-library',
            'title': 'Start Talking',
            'type': 'chat',
            'subtitle': 'Silent · Open Floor · Group',
            'vibe': 'A room for gentle introductions and shared focus',
            'gradient': 'linear-gradient(135deg, #3a5a8f 0%, #6a8fc0 100%)',
            'status': 'SOON',
            'participants': 7,
            'plan': {'steps': ['Send first message', 'Icebreaker question']},
            'created_at': '2026-04-26T10:20:00Z',
        },
        {
            'event_id': 2,
            'match_id': 1,
            'room_id': 'focus-hall',
            'title': 'Morning Focus Sprint',
            'type': 'chat',
            'subtitle': 'Pomodoro · Silent · Group',
            'vibe': 'Join a focused sprint block and review your checklist',
            'gradient': 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
            'status': 'LIVE',
            'participants': 16,
            'plan': {'steps': ['Set your goal', '25 min sprint', '5 min break', 'Repeat']},
            'created_at': '2026-04-26T10:30:00Z',
        },
        {
            'event_id': 3,
            'match_id': 1,
            'room_id': 'exam-rush',
            'title': 'Exam Quick Review',
            'type': 'battle',
            'subtitle': 'Fast Recall · Competitive · Team',
            'vibe': 'Rapid recall rounds before finals week',
            'gradient': 'linear-gradient(135deg, #134e4a 0%, #0f766e 100%)',
            'status': 'LIVE',
            'participants': 21,
            'plan': {'steps': ['Topic draw', '2-min explain', 'Peer challenge', 'Scoreboard']},
            'created_at': '2026-04-26T10:45:00Z',
        },
        {
            'event_id': 4,
            'match_id': 1,
            'room_id': 'quiet-lab',
            'title': 'Deep Work Evening',
            'type': 'date',
            'subtitle': 'Calm · Long Session · 1-on-1',
            'vibe': 'Quiet paired study for difficult chapters',
            'gradient': 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            'status': 'SOON',
            'participants': 6,
            'plan': {'steps': ['Set chapter target', 'Silent session', 'Recap key points']},
            'created_at': '2026-04-26T11:00:00Z',
        },
        {
            'event_id': 5,
            'match_id': 1,
            'room_id': 'group-sprint',
            'title': 'Project Team Sync',
            'type': 'chat',
            'subtitle': 'Planning · Collaborative · Team',
            'vibe': 'Structure deliverables and unblock project tasks',
            'gradient': 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
            'status': 'SOON',
            'participants': 11,
            'plan': {'steps': ['Task mapping', 'Priority vote', 'Owner assignment', 'Deadline check']},
            'created_at': '2026-04-26T11:10:00Z',
        },
        {
            'event_id': 6,
            'match_id': 1,
            'room_id': 'night-library',
            'title': 'Late Night Reflection',
            'type': 'chat',
            'subtitle': 'Light Wrap-up · Quiet · Group',
            'vibe': 'Review what you finished and plan tomorrow',
            'gradient': 'linear-gradient(135deg, #312e81 0%, #7c3aed 100%)',
            'status': 'ENDED',
            'participants': 9,
            'plan': {'steps': ['Wins today', 'Missed tasks', 'Tomorrow first step']},
            'created_at': '2026-04-26T11:30:00Z',
        }
    ]
}

DEMO_STUDY_ROOMS = {
    'rooms': [
        {
            'room_id': 'focus-hall',
            'order': 1,
            'title': 'Focus Hall',
            'subtitle': 'Silent room for deep work and revision',
            'description': 'Join a room, see who is studying, and keep your attention on the task. Chat is disabled so everyone stays focused.',
            'people': '18 students',
            'vibe': 'Quiet • focused • warm light',
            'track': 'Rain Study',
            'gradient': 'linear-gradient(135deg, #0f172a, #1d4ed8)',
            'status': 'OPEN',
            'tracks': [
                { 'label': 'Rain Study', 'file': "A Dyin' Breed - The Grey Room _ Density & Time.mp3" },
                { 'label': 'Moonlight Beats', 'file': 'Down The Rabbit Hole - The Grey Room _ Density & Time.mp3' },
            ],
            'participants': [
                { 'name': 'Maya', 'focus': 'Calculus notes', 'avatar': 'M' },
                { 'name': 'Noah', 'focus': 'Django revisions', 'avatar': 'N' },
            ],
        },
        {
            'room_id': 'night-library',
            'order': 2,
            'title': 'Night Library',
            'subtitle': 'Shared lo-fi room for late-night concentration',
            'description': 'This room is built for quiet co-study. You can join, watch everyone focusing, and choose a lo-fi mix to match the pace.',
            'people': '42 students',
            'vibe': 'Soft beats • shared pomodoro',
            'track': 'Moonlight Beats',
            'gradient': 'linear-gradient(135deg, #312e81, #7c3aed)',
            'status': 'LIVE',
            'tracks': [
                { 'label': 'Moonlight Beats', 'file': 'Down The Rabbit Hole - The Grey Room _ Density & Time.mp3' },
                { 'label': 'Coffee & Loops', 'file': 'Drop Of A Hat - The Grey Room _ Density & Time.mp3' },
            ],
            'participants': [
                { 'name': 'Sara', 'focus': 'Essay draft', 'avatar': 'S' },
                { 'name': 'Omar', 'focus': 'Exam prep', 'avatar': 'O' },
            ],
        },
        {
            'room_id': 'exam-rush',
            'order': 3,
            'title': 'Exam Rush Room',
            'subtitle': 'A calm room for focused revision sprints',
            'description': 'Use the room like a virtual library table: everyone is visible, nobody talks, and the background lo-fi keeps the energy steady.',
            'people': '26 students',
            'vibe': 'Low pressure • checklist mode',
            'track': 'Coffee & Loops',
            'gradient': 'linear-gradient(135deg, #134e4a, #0f766e)',
            'status': 'OPEN',
            'tracks': [
                { 'label': 'Coffee & Loops', 'file': 'Drop Of A Hat - The Grey Room _ Density & Time.mp3' },
                { 'label': 'Twilight Notes', 'file': 'Twinkle - The Grey Room _ Density & Time.mp3' },
            ],
            'participants': [
                { 'name': 'Iris', 'focus': 'Biology review', 'avatar': 'I' },
                { 'name': 'Sam', 'focus': 'Past papers', 'avatar': 'S' },
            ],
        },
        {
            'room_id': 'desk-setup',
            'order': 4,
            'title': 'Desk Setup Corner',
            'subtitle': 'Aesthetic co-working room for planning and note-taking',
            'description': 'A soft room for getting organized. Join, see the other people, and stay in flow with a lo-fi track in the background.',
            'people': '11 students',
            'vibe': 'Calm desk cam • no chat',
            'track': 'Soft Keys',
            'gradient': 'linear-gradient(135deg, #7c2d12, #ea580c)',
            'status': 'OPEN',
            'tracks': [
                { 'label': 'Soft Keys', 'file': 'Floating On Fire - The Grey Room _ Density & Time.mp3' },
                { 'label': 'Warm Up', 'file': 'On The Flip - The Grey Room _ Density & Time.mp3' },
                { 'label': 'Night Shift', 'file': 'Illusions - Anno Domini Beats.mp3' },
            ],
            'participants': [
                { 'name': 'Ivy', 'focus': 'Note cleanup', 'avatar': 'I' },
                { 'name': 'Tom', 'focus': 'Reading plan', 'avatar': 'T' },
            ],
        },
        {
            'room_id': 'quiet-lab',
            'order': 5,
            'title': 'Quiet Lab',
            'subtitle': 'Minimal room for distraction-free sessions',
            'description': 'A minimal room for students who prefer low visual noise and long concentration blocks.',
            'people': '9 students',
            'vibe': 'Minimal • dim light • long blocks',
            'track': 'Twilight Notes',
            'gradient': 'linear-gradient(135deg, #1f2937, #374151)',
            'status': 'OPEN',
            'tracks': [
                { 'label': 'Twilight Notes', 'file': 'Twinkle - The Grey Room _ Density & Time.mp3' },
                { 'label': 'Night Shift', 'file': 'Illusions - Anno Domini Beats.mp3' },
            ],
            'participants': [
                { 'name': 'Lina', 'focus': 'Discrete math', 'avatar': 'L' },
                { 'name': 'Karim', 'focus': 'Algorithm drills', 'avatar': 'K' },
                { 'name': 'Rita', 'focus': 'Systems notes', 'avatar': 'R' },
            ],
        },
        {
            'room_id': 'group-sprint',
            'order': 6,
            'title': 'Group Sprint Room',
            'subtitle': 'Team-focused room for project milestones',
            'description': 'Use this room to align on tasks, then switch to silent focus blocks while staying visible as a team.',
            'people': '15 students',
            'vibe': 'Team flow • deadline mode • focused blocks',
            'track': 'Warm Up',
            'gradient': 'linear-gradient(135deg, #0b3b2e, #0f766e)',
            'status': 'LIVE',
            'tracks': [
                { 'label': 'Warm Up', 'file': 'On The Flip - The Grey Room _ Density & Time.mp3' },
                { 'label': 'Coffee & Loops', 'file': 'Drop Of A Hat - The Grey Room _ Density & Time.mp3' },
                { 'label': 'Rain Study', 'file': "A Dyin' Breed - The Grey Room _ Density & Time.mp3" },
            ],
            'participants': [
                { 'name': 'Yasmin', 'focus': 'UI review', 'avatar': 'Y' },
                { 'name': 'Hadi', 'focus': 'API cleanup', 'avatar': 'H' },
                { 'name': 'Nabil', 'focus': 'Test cases', 'avatar': 'N' },
            ],
        },
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
