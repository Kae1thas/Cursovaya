from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter
from events import views
from events.views import (
    EventViewSet, CategoryViewSet, LocationViewSet, PublicEventsView, 
    RegisterView, RequestViewSet, UserViewSet, get_user_role, UpdateUserRoleView
)

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'requests', RequestViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', obtain_auth_token, name='get_token'),
    path('admin/', admin.site.urls),
    path('', views.event_list, name='event_list'),
    path('event/<int:event_id>/', views.event_detail, name='event_detail'),
    path('events/', views.event_list, name='event_list'),
    path('api/user-role/', get_user_role, name='user-role'),
    path('api/public-events/', PublicEventsView.as_view(), name='public-events'),
    path('api/users/<int:user_id>/update-role/', UpdateUserRoleView.as_view(), name='update-user-role'),  # Исправлено
]





