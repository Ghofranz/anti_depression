from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import render
from django.db.models import Q
from django.shortcuts import get_object_or_404
import os

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import Confession, Match, ChatMessage, RevealRequest, Event, LofiTrack, News, AcademicProfile, StudyMessage, StudyParticipant, StudyRoom
from .serializers import (
    AcademicProfileSerializer,
    ChatMessageSerializer,
    ConfessionSerializer,
    LofiTrackSerializer,
    MatchSerializer,
    NewsSerializer,
    StudyMessageSerializer,
    StudyRoomSerializer,
)


def get_user(request) -> User:
    """Cast request.user to User so the IDE resolves attributes correctly."""
    return request.user  # type: ignore[return-value]


def public_index(request):
    frontend_url = os.environ.get('FRONTEND_URL', 'https://compuslife.netlify.app')
    return render(request, 'core/index.html', {
        'frontend_url': frontend_url,
        'admin_url': '/admin/',
        'api_url': '/api/news/',
    })


# ─── Auth ───────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def sign_up(request):
    data = request.data

    required = ['username', 'password']
    missing = [f for f in required if f not in data]
    if missing:
        return Response({"error": f"Missing fields: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=data['username']).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=data['username'],
        password=data['password'],
        email=data.get('email', ''),
        first_name=data.get('name', ''),
    )

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "message": "Account created successfully",
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.first_name,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    # Cast to User for IDE type resolution
    typed_user: User = user  # type: ignore[assignment]
    token, _ = Token.objects.get_or_create(user=typed_user)

    return Response({
        "token": token.key,
        "user": {
            "id": typed_user.id,
            "username": typed_user.username,
            "email": typed_user.email,
            "name": typed_user.first_name,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    user = get_user(request)
    Token.objects.filter(user=user).delete()  # avoids auth_token reverse accessor warning
    return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)


# ─── Confessions ─────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def confession_list(request):
    user = get_user(request)

    if request.method == 'POST':
        data = request.data

        required = ['text', 'emotion', 'location_hint']
        missing = [f for f in required if f not in data]
        if missing:
            return Response({"error": f"Missing fields: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

        confession = Confession.objects.create(
            text=data['text'],
            emotion=data['emotion'],
            location_hint=data['location_hint'],
            author=user
        )

        serializer = ConfessionSerializer(confession)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # GET — return only the current user's confessions
    conf = Confession.objects.filter(author=user)
    serializer = ConfessionSerializer(conf, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_confessions(request):
    conf = Confession.objects.all()
    serializer = ConfessionSerializer(conf, many=True)
    return Response(serializer.data)


# ─── Matches ─────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_matches(request, confession_id):
    matches = Match.objects.filter(
        Q(confession_a_id=confession_id) | Q(confession_b_id=confession_id)
    )
    serializer = MatchSerializer(matches, many=True)
    return Response(serializer.data)


# ─── Chat ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    serializer = ChatMessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat(request, match_id):
    messages = ChatMessage.objects.filter(match_id=match_id).order_by('timestamp')
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)


# ─── Reveal ──────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_reveal(request):
    user = get_user(request)
    match_id = request.data.get("match")
    confession_id = request.data.get("confession")

    if not match_id or not confession_id:
        return Response({"error": "match and confession are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        confession = Confession.objects.get(id=confession_id)
    except Confession.DoesNotExist:
        return Response({"error": "Confession not found"}, status=status.HTTP_404_NOT_FOUND)

    if confession.author != user:
        return Response({"error": "You can only reveal your own confessions"}, status=status.HTTP_403_FORBIDDEN)

    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response({"error": "Match not found"}, status=status.HTTP_404_NOT_FOUND)

    reveal, _ = RevealRequest.objects.get_or_create(match_id=match_id)

    if confession.id == match.confession_a.id:
        reveal.confession_a_accepted = True
    elif confession.id == match.confession_b.id:
        reveal.confession_b_accepted = True
    else:
        return Response({"error": "This confession is not part of the match"}, status=status.HTTP_400_BAD_REQUEST)

    reveal.save()
    reveal.try_reveal()

    return Response({
        "revealed": reveal.revealed,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.first_name,
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_contact_exchange_status(request, match_id):
    user = get_user(request)
    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response({"error": "Match not found"}, status=status.HTTP_404_NOT_FOUND)

    if user != match.confession_a.author and user != match.confession_b.author:
        return Response({"error": "Forbidden: You are not part of this match."}, status=status.HTTP_403_FORBIDDEN)

    try:
        reveal = RevealRequest.objects.get(match=match)
    except RevealRequest.DoesNotExist:
        return Response({
            "match": match_id,
            "my_contact_exchange_active": False,
            "peer_contact_exchange_active": False,
            "both_active": False,
            "my_profile": None,
            "peer_profile": None
        }, status=status.HTTP_200_OK)

    my_active = False
    peer_active = False
    peer_user = None

    if user == match.confession_a.author:
        my_active = reveal.confession_a_accepted
        peer_active = reveal.confession_b_accepted
        peer_user = match.confession_b.author
    else:
        my_active = reveal.confession_b_accepted
        peer_active = reveal.confession_a_accepted
        peer_user = match.confession_a.author

    both_active = (my_active and peer_active)

    my_profile_data = None
    if hasattr(user, 'academic_profile'):
        my_profile_data = AcademicProfileSerializer(user.academic_profile).data

    peer_profile_data = None
    if both_active and peer_user and hasattr(peer_user, 'academic_profile'):
        peer_profile_data = AcademicProfileSerializer(peer_user.academic_profile).data

    return Response({
        "match": match_id,
        "my_contact_exchange_active": my_active,
        "peer_contact_exchange_active": peer_active,
        "both_active": both_active,
        "my_profile": my_profile_data,
        "peer_profile": peer_profile_data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_contact_exchange(request, match_id):
    user = get_user(request)

    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response({"error": "Match not found"}, status=status.HTTP_404_NOT_FOUND)

    if user != match.confession_a.author and user != match.confession_b.author:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    reveal, _ = RevealRequest.objects.get_or_create(match=match)

    my_active = False
    peer_active = False
    peer_user = None

    if user == match.confession_a.author:
        reveal.confession_a_accepted = True
        my_active = True
        peer_active = reveal.confession_b_accepted
        peer_user = match.confession_b.author
    else:
        reveal.confession_b_accepted = True
        my_active = True
        peer_active = reveal.confession_a_accepted
        peer_user = match.confession_a.author

    reveal.save()
    # DO NOT call reveal.try_reveal() to protect confession.is_revealed from mutating!

    both_active = (my_active and peer_active)

    my_profile_data = None
    if hasattr(user, 'academic_profile'):
        my_profile_data = AcademicProfileSerializer(user.academic_profile).data

    peer_profile_data = None
    if both_active and peer_user and hasattr(peer_user, 'academic_profile'):
        peer_profile_data = AcademicProfileSerializer(peer_user.academic_profile).data

    return Response({
        "message": "Contact exchange activated",
        "my_contact_exchange_active": my_active,
        "peer_contact_exchange_active": peer_active,
        "both_active": both_active,
        "my_profile": my_profile_data,
        "peer_profile": peer_profile_data
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def manage_academic_profile(request):
    user = get_user(request)

    if request.method == 'GET':
        if hasattr(user, 'academic_profile'):
            serializer = AcademicProfileSerializer(user.academic_profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method in ['POST', 'PUT']:
        data = request.data
        if hasattr(user, 'academic_profile'):
            profile = user.academic_profile
            profile.display_name = data.get('display_name', profile.display_name)
            profile.academic_email = data.get('academic_email', profile.academic_email)
            profile.programme = data.get('programme', profile.programme)
            profile.bio = data.get('bio', profile.bio)
            profile.save()
            return Response(AcademicProfileSerializer(profile).data, status=status.HTTP_200_OK)
        else:
            required = ['display_name', 'academic_email', 'programme']
            missing = [f for f in required if not data.get(f)]
            if missing:
                return Response({"error": f"Missing fields: {', '.join(missing)}"}, status=status.HTTP_400_BAD_REQUEST)
            
            profile = AcademicProfile.objects.create(
                user=user,
                display_name=data['display_name'],
                academic_email=data['academic_email'],
                programme=data['programme'],
                bio=data.get('bio', '')
            )
            return Response(AcademicProfileSerializer(profile).data, status=status.HTTP_201_CREATED)

# ─── Events ──────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_events_for_user(request):
    user = get_user(request)
    events = Event.objects.filter(
        Q(match__confession_a__author=user) |
        Q(match__confession_b__author=user)
    ).select_related('match')

    data = []
    for event in events:
        data.append({
            'event_id': event.id,
            'match_id': event.match.id,
            'title': event.title,
            'type': event.type,
            'plan': event.plan,
            'created_at': event.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return Response({'events': data}, status=status.HTTP_200_OK)


# ─── News ───────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def news_list(request):
    if request.method == 'POST':
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"error": "Admin only"}, status=status.HTTP_403_FORBIDDEN)

        serializer = NewsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    news = News.objects.filter(is_published=True).order_by('-created_at')
    serializer = NewsSerializer(news, many=True)
    return Response({'news': serializer.data}, status=status.HTTP_200_OK)


# ─── Lo-fi ──────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def lofi_tracks(request):
    if request.method == 'POST':
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"error": "Admin only"}, status=status.HTTP_403_FORBIDDEN)

        serializer = LofiTrackSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    tracks = LofiTrack.objects.filter(is_published=True).order_by('-created_at')
    serializer = LofiTrackSerializer(tracks, many=True, context={'request': request})
    return Response({'tracks': serializer.data}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def study_rooms(request):
    user = get_user(request)

    if request.method == 'POST':
        data = request.data
        title = (data.get('title') or '').strip()
        topic = (data.get('topic') or '').strip()

        if not title or not topic:
            return Response({'error': 'title and topic are required'}, status=status.HTTP_400_BAD_REQUEST)

        room = StudyRoom.objects.create(
            title=title,
            topic=topic,
            description=(data.get('description') or '').strip(),
            duration_minutes=int(data.get('duration_minutes') or 25),
            created_by=user,
        )
        StudyParticipant.objects.create(
            room=room,
            user=user,
            focus=(data.get('focus') or '').strip(),
            is_active=True,
        )
        return Response(StudyRoomSerializer(room).data, status=status.HTTP_201_CREATED)

    rooms = StudyRoom.objects.filter(is_active=True).order_by('-started_at')
    return Response({'rooms': StudyRoomSerializer(rooms, many=True).data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def study_room_detail(request, room_id):
    room = get_object_or_404(StudyRoom, id=room_id)
    return Response(StudyRoomSerializer(room).data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_study_room(request, room_id):
    user = get_user(request)
    room = get_object_or_404(StudyRoom, id=room_id)
    participant, _ = StudyParticipant.objects.get_or_create(room=room, user=user)
    participant.focus = (request.data.get('focus') or participant.focus or '').strip()
    participant.is_active = True
    participant.save()
    return Response(StudyRoomSerializer(room).data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_study_room(request, room_id):
    user = get_user(request)
    room = get_object_or_404(StudyRoom, id=room_id)
    StudyParticipant.objects.filter(room=room, user=user).update(is_active=False)
    return Response({'message': 'Left room'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def study_room_messages(request, room_id):
    user = get_user(request)
    room = get_object_or_404(StudyRoom, id=room_id)

    if request.method == 'POST':
        message = (request.data.get('message') or '').strip()
        if not message:
            return Response({'error': 'message is required'}, status=status.HTTP_400_BAD_REQUEST)

        StudyParticipant.objects.get_or_create(room=room, user=user, defaults={'is_active': True})
        row = StudyMessage.objects.create(room=room, user=user, message=message)
        return Response(StudyMessageSerializer(row).data, status=status.HTTP_201_CREATED)

    messages = StudyMessage.objects.filter(room=room).order_by('timestamp')
    return Response({'messages': StudyMessageSerializer(messages, many=True).data}, status=status.HTTP_200_OK)
