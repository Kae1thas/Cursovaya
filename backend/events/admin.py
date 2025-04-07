from django.contrib import admin
from django.contrib.admin import ModelAdmin
from .models import Category, Location, Event, UserProfile, Request

# Регистрация UserProfile
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username',)

# Регистрация Request
@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'request_type', 'status', 'created_at', 'reviewed_by')
    list_filter = ('request_type', 'status')
    search_fields = ('user__username',)


# Настройка админ-панели для Event
@admin.register(Event)
class EventAdmin(ModelAdmin):
    list_display = ('title', 'start_time', 'end_time', 'author', 'category', 'location', 'is_public')
    list_filter = ('is_public', 'category', 'location', 'start_time')  # Фильтры в боковой панели
    search_fields = ('title', 'description', 'author__username')  # Поиск по названию, описанию и автору
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'author')
        }),
        ('Дата и время', {
            'fields': ('start_time', 'end_time')
        }),
        ('Место и категория', {
            'fields': ('location', 'category', 'is_public')
        }),
    )
    autocomplete_fields = ('author', 'location', 'category')  # Автозаполнение для связанных полей
    ordering = ('-start_time',)  # Сортировка по убыванию даты начала

    # Предзаполнение поля author текущим пользователем
    def save_model(self, request, obj, form, change):
        if not obj.pk:  # Если объект новый
            obj.author = request.user
        super().save_model(request, obj, form, change)

    # Сохранение кастомных стилей
    class Media:
        css = {
            'all': ('css/admin.css',)  # Ваш кастомный CSS
        }

# Настройка Category
@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}  # Автоматическое заполнение slug на основе name

# Настройка Location
@admin.register(Location)
class LocationAdmin(ModelAdmin):
    list_display = ('name', 'city', 'capacity')
    search_fields = ('name', 'city', 'address')
    list_filter = ('city',)