from django.urls import path
from .views import (
    activate_contact_exchange_view,
    confession_list,
    get_all_confessions,
    get_chat,
    get_contact_exchange_status_view,
    get_events_for_user_view,
    get_matches,
    login,
    manage_academic_profile,
    request_reveal,
    send_message,
    sign_up,
)

urlpatterns = [
    path('confess/', confession_list),
    path('confess/all/', get_all_confessions),
    path('matches/<int:confession_id>/', get_matches),
    path('chat/send/', send_message),
    path('chat/<int:match_id>/', get_chat),
    path('reveal/', request_reveal),
    path('contact-exchange/status/<int:match_id>/', get_contact_exchange_status_view),
    path('contact-exchange/activate/<int:match_id>/', activate_contact_exchange_view),
    path('profile/me/', manage_academic_profile),
    path('events/', get_events_for_user_view),
    path('sign_up/', sign_up),
    path('login/', login),
]
