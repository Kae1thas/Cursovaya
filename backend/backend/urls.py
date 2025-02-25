from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include

def home(request):
    return HttpResponse("Добро пожаловать на главную страницу!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('events.urls')),
    path("", home),
]
