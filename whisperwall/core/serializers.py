from rest_framework import serializers
from .models import Confession, Match, ChatMessage, RevealRequest, Event


class ConfessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Confession
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

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