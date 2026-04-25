from django.urls import path
from .views import get_matches, send_message, get_chat, request_reveal, confession_list, sign_up, login, get_reveal_status, activate_profile_sharing

urlpatterns = [
    path('confess/',confession_list),
    path('matches/<int:confession_id>/', get_matches),
    path('chat/send/', send_message),
    path('chat/<int:match_id>/', get_chat),
    path('reveal/', request_reveal),
    path('reveal/status/<int:match_id>/', get_reveal_status),
    path('reveal/activate/<int:match_id>/', activate_profile_sharing),
    path('sign_up/', sign_up),
    path('login/', login)
]
