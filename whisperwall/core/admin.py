from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Confession, Match, ChatMessage, RevealRequest, Event, Live, News, LofiTrack, Notification

admin.site.register(Confession)
admin.site.register(Match)
admin.site.register(ChatMessage)
admin.site.register(RevealRequest)
admin.site.register(Event)
admin.site.register(Live)
admin.site.register(News)
admin.site.register(LofiTrack)
admin.site.register(Notification)