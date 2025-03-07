from django.db import models

class Event(models.Model):
    title = models.CharField(max_length=255)  # Название обязательно
    description = models.TextField(default="Описание отсутствует")  # Даем значение по умолчанию
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255, default="Не указано")  # Даем значение по умолчанию

    def __str__(self):
        return self.title
