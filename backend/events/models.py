from django.core.exceptions import ValidationError
from django.utils.timezone import now
from django.db import models


def validate_year(value):
    if value.year < 1900 or value.year > 2100:  # Задаем разумные пределы
        raise ValidationError("Год должен быть в диапазоне 1900-2100")

class Event(models.Model):
    title = models.CharField(max_length=255)  
    description = models.TextField(default="Описание отсутствует", blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255, default="Не указано", blank=True, null=True)

    def __str__(self):
        return self.title
