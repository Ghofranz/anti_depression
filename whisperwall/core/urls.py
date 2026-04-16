from django.urls import path
from .views import get_matches, send_message, get_chat, request_reveal, confession_list, sign_up

urlpatterns = [
    path('confess/',confession_list),
    path('matches/<int:confession_id>/', get_matches),
    path('chat/send/', send_message),
    path('chat/<int:match_id>/', get_chat),
    path('reveal/', request_reveal),
    path('sign_up',sign_up)

]
