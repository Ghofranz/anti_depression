import requests
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .firebase_store import (
    activate_contact_exchange,
    create_confession,
    get_all_confessions as get_all_confessions_store,
    get_chat_messages,
    get_contact_exchange_status,
    get_events_for_user,
    get_matches_for_confession,
    get_or_update_profile,
    get_study_room,
    get_user_by_username,
    list_confessions_by_author_uid,
    list_study_rooms,
    request_reveal as do_request_reveal,
    send_chat_message,
    upsert_user_profile,
)


class FirebaseRequestUser:
    uid: str
    username: str
    email: str
    name: str


def get_user(request) -> FirebaseRequestUser:
    return request.user  # type: ignore[return-value]


def _firebase_rest_url(endpoint: str) -> str:
    key = settings.FIREBASE_WEB_API_KEY
    return f'https://identitytoolkit.googleapis.com/v1/{endpoint}?key={key}'


def _ensure_web_api_key():
    if not settings.FIREBASE_WEB_API_KEY:
        return False
    return True


def _normalize_email(username: str, email: str) -> str:
    if email and '@' in email:
        return email
    safe = username.strip().lower().replace(' ', '.')
    return f'{safe}@whisperwall.local'


@api_view(['POST'])
@permission_classes([AllowAny])
def sign_up(request):
    data = request.data

    required = ['username', 'password']
    missing = [f for f in required if f not in data]
    if missing:
        return Response({'error': f"Missing fields: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

    if not _ensure_web_api_key():
        return Response({'error': 'Missing FIREBASE_WEB_API_KEY in backend configuration.'}, status=500)

    username = data['username'].strip()
    password = data['password']
    name = data.get('name', '').strip()
    email = _normalize_email(username, data.get('email', '').strip())

    try:
        existing = get_user_by_username(username)
    except Exception as exc:
        return Response({'error': f'User lookup failed: {exc}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    if existing:
        return Response({'error': 'Username already taken. Please log in instead.'}, status=status.HTTP_409_CONFLICT)

    payload = {
        'email': email,
        'password': password,
        'returnSecureToken': True,
    }

    try:
        resp = requests.post(_firebase_rest_url('accounts:signUp'), json=payload, timeout=20)
        body = resp.json()
    except Exception as exc:
        return Response({'error': f'Firebase sign up failed: {exc}'}, status=500)

    if resp.status_code >= 400:
        firebase_error = body.get('error', {}).get('message', 'Sign up failed')
        if firebase_error == 'EMAIL_EXISTS':
            return Response({'error': 'Email already exists. Please log in instead.'}, status=status.HTTP_409_CONFLICT)
        return Response({'error': firebase_error}, status=status.HTTP_400_BAD_REQUEST)

    uid = body.get('localId', '')
    id_token = body.get('idToken', '')

    if not uid or not id_token:
        return Response({'error': 'Invalid Firebase sign up response.'}, status=500)

    try:
        upsert_user_profile(uid=uid, username=username, email=email, name=name)
    except Exception as exc:
        return Response({'error': f'User profile write failed: {exc}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response(
        {
            'message': 'Account created successfully',
            'token': id_token,
            'user': {
                'id': uid,
                'username': username,
                'email': email,
                'name': name,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if not _ensure_web_api_key():
        return Response({'error': 'Missing FIREBASE_WEB_API_KEY in backend configuration.'}, status=500)

    try:
        lookup = get_user_by_username(username)
    except Exception as exc:
        return Response({'error': f'User lookup failed: {exc}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    if lookup:
        email = lookup.get('email', '')
        display_name = lookup.get('name', '')
    else:
        email = username if '@' in username else _normalize_email(username, '')
        display_name = ''

    payload = {
        'email': email,
        'password': password,
        'returnSecureToken': True,
    }

    try:
        resp = requests.post(_firebase_rest_url('accounts:signInWithPassword'), json=payload, timeout=20)
        body = resp.json()
    except Exception as exc:
        return Response({'error': f'Firebase login failed: {exc}'}, status=500)

    if resp.status_code >= 400:
        return Response({'error': body.get('error', {}).get('message', 'Invalid credentials')}, status=401)

    uid = body.get('localId', '')
    id_token = body.get('idToken', '')

    if not uid or not id_token:
        return Response({'error': 'Invalid Firebase login response.'}, status=500)

    username_out = (lookup or {}).get('username') or username
    email_out = body.get('email', email)
    name_out = display_name or body.get('displayName', '')

    try:
        upsert_user_profile(uid=uid, username=username_out, email=email_out, name=name_out)
    except Exception as exc:
        return Response({'error': f'User profile write failed: {exc}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response(
        {
            'token': id_token,
            'user': {
                'id': uid,
                'username': username_out,
                'email': email_out,
                'name': name_out,
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def confession_list(request):
    user = get_user(request)

    if request.method == 'POST':
        data = request.data

        required = ['text', 'emotion', 'location_hint']
        missing = [f for f in required if f not in data]
        if missing:
            return Response({'error': f"Missing fields: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

        confession = create_confession(data=data, user=user)
        return Response(confession, status=status.HTTP_201_CREATED)

    conf = list_confessions_by_author_uid(user.uid)
    return Response(conf)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_confessions(request):
    return Response(get_all_confessions_store())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_matches(request, confession_id):
    return Response(get_matches_for_confession(confession_id))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    data = request.data
    required = ['match', 'sender', 'message']
    missing = [f for f in required if f not in data]
    if missing:
        return Response({'error': f"Missing fields: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

    row = send_chat_message(
        match_id=int(data['match']),
        sender_confession_id=int(data['sender']),
        message=str(data['message']),
    )
    return Response(row, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat(request, match_id):
    return Response(get_chat_messages(int(match_id)))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_reveal(request):
    user = get_user(request)
    match_id = request.data.get('match')
    confession_id = request.data.get('confession')

    if not match_id or not confession_id:
        return Response({'error': 'match and confession are required'}, status=status.HTTP_400_BAD_REQUEST)

    reveal, error, code = do_request_reveal(int(match_id), int(confession_id), user.uid)
    if error:
        return Response({'error': error}, status=code)

    return Response(
        {
            'revealed': reveal.get('revealed', False),
            'user': {
                'id': user.uid,
                'username': user.username,
                'email': user.email,
                'name': user.name,
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_contact_exchange_status_view(request, match_id):
    user = get_user(request)
    payload, error, code = get_contact_exchange_status(int(match_id), user.uid)
    if error:
        return Response({'error': error}, status=code)
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_contact_exchange_view(request, match_id):
    user = get_user(request)
    payload, error, code = activate_contact_exchange(int(match_id), user.uid)
    if error:
        return Response({'error': error}, status=code)
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def manage_academic_profile(request):
    user = get_user(request)

    if request.method == 'GET':
        profile, error, code = get_or_update_profile(user.uid)
        if error:
            return Response({'error': error}, status=code)
        return Response(profile, status=status.HTTP_200_OK)

    data = request.data if isinstance(request.data, dict) else {}
    profile, error, code = get_or_update_profile(user.uid, data)
    if error:
        return Response({'error': error}, status=code)
    return Response(profile, status=code)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_events_for_user_view(request):
    user = get_user(request)
    return Response(get_events_for_user(user.uid), status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_study_rooms_view(request):
    return Response({'rooms': list_study_rooms()}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_study_room_view(request, room_id):
    room = get_study_room(room_id)
    if not room:
        return Response({'error': 'Study room not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(room, status=status.HTTP_200_OK)
