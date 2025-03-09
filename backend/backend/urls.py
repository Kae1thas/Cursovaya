from django.urls import path, include
from rest_framework.routers import DefaultRouter
from events.views import EventViewSet 
from rest_framework.authtoken.views import obtain_auth_token
from events.views import RegisterView


router = DefaultRouter()
router.register(r'events', EventViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', obtain_auth_token, name='get_token'),
]
