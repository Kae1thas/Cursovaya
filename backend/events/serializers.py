from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Event, Category, Location, EventParticipant  # Импортируем все модели

# Сериализатор для пользователей (для вложенного отображения автора)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

# Сериализатор для категорий
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

# Сериализатор для локаций
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'city']

# Сериализатор для участников мероприятий
class EventParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = EventParticipant
        fields = ['id', 'user', 'registered_at']

# Сериализатор для регистрации (оставляем без изменений)
class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Пароли не совпадают'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

# Сериализатор для событий
class EventSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)  # Только для чтения, заполняется автоматически
    category = CategorySerializer(read_only=True)  # Вложенное отображение категории
    location = LocationSerializer(read_only=True)  # Вложенное отображение локации
    participants = EventParticipantSerializer(many=True, read_only=True)  # Список участников

    # Поля для записи (ID для category и location)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source='location', write_only=True, required=False
    )

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time', 'author', 'location', 
            'category', 'is_public', 'created_at', 'updated_at', 'participants', 
            'category_id', 'location_id'
        ]

    def create(self, validated_data):
        # Автоматически устанавливаем автора как текущего пользователя
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)