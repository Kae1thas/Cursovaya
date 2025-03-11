from django.urls import path, include
from rest_framework.routers import DefaultRouter
from events.views import EventViewSet 
from rest_framework.authtoken.views import obtain_auth_token
from events.views import RegisterView
from django.contrib import admin

router = DefaultRouter()
router.register(r'events', EventViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', obtain_auth_token, name='get_token'),
    path('admin/', admin.site.urls),
]
