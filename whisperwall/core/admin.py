from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Confession, Match, ChatMessage, RevealRequest, Event, Live

admin.site.register(Confession)
admin.site.register(Match)
admin.site.register(ChatMessage)
admin.site.register(RevealRequest)
admin.site.register(Event)
admin.site.register(Live)