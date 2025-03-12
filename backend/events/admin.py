from django.contrib import admin
from django.contrib.admin import ModelAdmin
from .models import Event

class EventAdmin(ModelAdmin):
    class Media:
        css = {
            'all': ('css/admin.css',)  # Указываем путь к файлу с вашими стилями
        }

admin.site.register(Event, EventAdmin)
