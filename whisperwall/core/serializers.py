from rest_framework import serializers
from .models import (
    AcademicProfile,
    ChatMessage,
    Confession,
    Event,
    LofiTrack,
    News,
    Match,
    Notification,
    RevealRequest,
    StudyMessage,
    StudyParticipant,
    StudyRoom,
)


class ConfessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Confession
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


class NewsSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = ['id', 'title', 'body', 'created_at', 'author_name']

    def get_author_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return 'Admin'


class LofiTrackSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = LofiTrack
        fields = ['id', 'title', 'file_url', 'created_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.audio_file.url)
        return obj.audio_file.url

class MatchSerializer(serializers.ModelSerializer):
    confession_a = ConfessionSerializer()
    confession_b = ConfessionSerializer()
    class Meta:
        model = Match
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'


class RevealSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevealRequest
        fields = '__all__'


class AcademicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicProfile
        fields = '__all__'


class StudyParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = StudyParticipant
        fields = ['id', 'username', 'name', 'focus', 'joined_at', 'last_seen', 'is_active']


class StudyMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = StudyMessage
        fields = ['id', 'room', 'username', 'name', 'message', 'timestamp']


class StudyRoomSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    participants = StudyParticipantSerializer(many=True, read_only=True)
    active_participant_count = serializers.SerializerMethodField()

    class Meta:
        model = StudyRoom
        fields = [
            'id',
            'title',
            'topic',
            'description',
            'duration_minutes',
            'started_at',
            'is_active',
            'created_by',
            'created_by_username',
            'participants',
            'active_participant_count',
        ]
        read_only_fields = ['created_by', 'started_at']

    def get_active_participant_count(self, obj):
        return obj.participants.filter(is_active=True).count()


class NotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True, allow_null=True)
    sender_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'title',
            'content',
            'sender_username',
            'sender_name',
            'related_id',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'notification_type', 'title', 'content', 'sender_username']
    
    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.get_full_name() or obj.sender.username
        return 'System'

