from rest_framework import serializers
from .models import Event
from django.utils import timezone


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'start_time', 'end_time', 'location', 'user']
        read_only_fields = ['user']  # Поле пользователя только для чтения, т.к. оно будет заполняться на сервере

        
def validate_start_time(self, value):
    if value < timezone.now():
        raise serializers.ValidationError("Start time cannot be in the past.")
    return value
