from django.urls import path, include
from rest_framework.routers import DefaultRouter
from events.views import EventViewSet, CategoryViewSet, LocationViewSet, PublicEventsView
from rest_framework.authtoken.views import obtain_auth_token
from events.views import RegisterView
from django.contrib import admin
from events import views
from django.urls import path

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"locations", LocationViewSet)


urlpatterns = [
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', obtain_auth_token, name='get_token'),
    path('admin/', admin.site.urls),
    path('', views.event_list, name='event_list'),  # Страница со списком мероприятий
    path('event/<int:event_id>/', views.event_detail, name='event_detail'),  # Страница с деталями мероприятия
    path('events/', views.event_list, name='event_list'),
    path('api/public-events/', PublicEventsView.as_view(), name='public-events'),  
]
