from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import Confession, Match, ChatMessage, RevealRequest, Event
from .serializers import ConfessionSerializer, MatchSerializer, ChatMessageSerializer


def get_user(request) -> User:
    """Cast request.user to User so the IDE resolves attributes correctly."""
    return request.user  # type: ignore[return-value]


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
def get_reveal_status(request, match_id):
    user = get_user(request)
    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response({"error": "Match not found"}, status=status.HTTP_404_NOT_FOUND)

    # Determine if user is part of the match
    if user != match.confession_a.author and user != match.confession_b.author:
        return Response({"error": "Forbidden: You are not part of this match."}, status=status.HTTP_403_FORBIDDEN)

    try:
        reveal = RevealRequest.objects.get(match=match)
    except RevealRequest.DoesNotExist:
        return Response({
            "match": match_id,
            "my_profile_sharing_active": False,
            "peer_profile_sharing_active": False,
            "both_active": False
        }, status=status.HTTP_200_OK)

    my_profile_sharing_active = False
    peer_profile_sharing_active = False

    if user == match.confession_a.author:
        my_profile_sharing_active = reveal.confession_a_accepted
        peer_profile_sharing_active = reveal.confession_b_accepted
    else:
        my_profile_sharing_active = reveal.confession_b_accepted
        peer_profile_sharing_active = reveal.confession_a_accepted

    both_active = (my_profile_sharing_active and peer_profile_sharing_active)

    return Response({
        "match": match_id,
        "my_profile_sharing_active": my_profile_sharing_active,
        "peer_profile_sharing_active": peer_profile_sharing_active,
        "both_active": both_active
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_profile_sharing(request, match_id):
    user = get_user(request)

    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response({"error": "Match not found"}, status=status.HTTP_404_NOT_FOUND)

    if user != match.confession_a.author and user != match.confession_b.author:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    reveal, _ = RevealRequest.objects.get_or_create(match=match)

    my_profile_sharing_active = False
    peer_profile_sharing_active = False

    if user == match.confession_a.author:
        reveal.confession_a_accepted = True
        my_profile_sharing_active = True
        peer_profile_sharing_active = reveal.confession_b_accepted
    else:
        reveal.confession_b_accepted = True
        my_profile_sharing_active = True
        peer_profile_sharing_active = reveal.confession_a_accepted

    reveal.save()
    reveal.try_reveal()

    both_active = (my_profile_sharing_active and peer_profile_sharing_active)

    return Response({
        "message": "Profile sharing activated",
        "my_profile_sharing_active": my_profile_sharing_active,
        "peer_profile_sharing_active": peer_profile_sharing_active,
        "both_active": both_active
    }, status=status.HTTP_200_OK)

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