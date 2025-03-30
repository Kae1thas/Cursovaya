from django.core.exceptions import ValidationError
from django.utils.timezone import now
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver 

ROLE_CHOICES = (
    ('user', 'Обычный пользователь'),
    ('moderator', 'Модератор'),
    ('admin', 'Админ'),
)

# Расширяем User через профиль
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=20,
        choices=[('user', 'User'), ('moderator', 'Moderator'), ('admin', 'Admin')],
        default='user'
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"
    
# Заявка на создание
class Request(models.Model):
    ACTION_CHOICES = [
        ('create', 'Создание'),
        ('update', 'Редактирование'),
        ('delete', 'Удаление'),
    ]
    TYPE_CHOICES = [
        ('event', 'Мероприятие'),
        ('category', 'Категория'),
        ('location', 'Локация'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    request_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, default='create')  # Новый тип действия
    data = models.JSONField()  # Данные для создания/редактирования
    event = models.ForeignKey('Event', on_delete=models.SET_NULL, null=True, blank=True)  # Связь с мероприятием для update/delete
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
        default='pending'
    )
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.request_type} - {self.action} - {self.user.username}"


# Валидатор для года
def validate_year(value):
    if value.year < 1900 or value.year > 2100:
        raise ValidationError("Год должен быть в диапазоне 1900-2100")


# Модель для категорий мероприятий
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True) 
    slug = models.SlugField(max_length=100, unique=True)  
    is_one_time = models.BooleanField(default=False)
    event_cat_one = models.OneToOneField('Event', on_delete=models.CASCADE, related_name='unique_category', null=True, blank=True)

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def __str__(self):
        return self.name


# Модель для локаций
class Location(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)  
    city = models.CharField(max_length=100, blank=True, null=True)  
    capacity = models.PositiveIntegerField(default=0, blank=True, null=True) 
    is_one_time = models.BooleanField(default=False)
    event_loc_one = models.OneToOneField('Event', on_delete=models.CASCADE, related_name='unique_location', null=True, blank=True)

    class Meta:
        verbose_name = "Локация"
        verbose_name_plural = "Локации"

    def __str__(self):
        return f"{self.name} ({self.city or 'Город не указан'})"


# Модель мероприятия
class Event(models.Model):
    # Основные поля
    title = models.CharField(max_length=255)  
    description = models.TextField(default="Описание отсутствует", blank=True, null=True)
    start_time = models.DateTimeField(validators=[validate_year])
    end_time = models.DateTimeField(validators=[validate_year])
    
    # Связь с другими моделями
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events", null=True, blank=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, blank=True, null=True, related_name="events")  # Локация
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True, related_name="events")  # Категория

    # Дополнительные поля
    is_public = models.BooleanField(default=True)  # Публичное или приватное мероприятие
    created_at = models.DateTimeField(auto_now_add=True)  # Дата создания
    updated_at = models.DateTimeField(auto_now=True)  # Дата последнего обновления

    class Meta:
        verbose_name = "Мероприятие"
        verbose_name_plural = "Мероприятия"

    def __str__(self):
        return self.title

    # Проверка на корректность времени
    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("Время окончания не может быть раньше времени начала")


# Пример добавления связи "участники мероприятия" (опционально)
class EventParticipant(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="participated_events")
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Участник мероприятия"
        verbose_name_plural = "Участники мероприятий"
        unique_together = ("event", "user")  # Один пользователь не может зарегистрироваться дважды

    def __str__(self):
        return f"{self.user.username} на {self.event.title}"
    
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)