from django.http import HttpResponseNotFound
from django.urls import path, include


def disabled_admin(_request):
    return HttpResponseNotFound('Admin is disabled in this Firebase-backed setup.')

urlpatterns = [
    path('admin/', disabled_admin),
    path('api/', include('core.urls'))
]
