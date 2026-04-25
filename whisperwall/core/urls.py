from django.urls import path
from .views import get_matches, send_message, get_chat, request_reveal, confession_list, sign_up, login, get_contact_exchange_status, activate_contact_exchange, manage_academic_profile

urlpatterns = [
    path('confess/',confession_list),
    path('matches/<int:confession_id>/', get_matches),
    path('chat/send/', send_message),
    path('chat/<int:match_id>/', get_chat),
    path('reveal/', request_reveal),
    path('contact-exchange/status/<int:match_id>/', get_contact_exchange_status),
    path('contact-exchange/activate/<int:match_id>/', activate_contact_exchange),
    path('profile/me/', manage_academic_profile),
    path('sign_up/', sign_up),
    path('login/', login)
]
