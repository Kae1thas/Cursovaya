from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Event, Category, Location, Request, UserProfile, User

# Сериализатор для UserProfile
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role']

# Сериализатор для User
class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True, source='userprofile')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'profile']

# Сериализатор для Request
class RequestSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    reviewed_by = serializers.StringRelatedField()

    class Meta:
        model = Request
        fields = '__all__'

# Сериализатор для категорий
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_profile = UserProfile.objects.get(user=request.user)
            if user_profile.role not in ['moderator', 'admin']:
                del representation['slug']
        else:
            del representation['slug']
        return representation

# Сериализатор для локаций
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'city', 'capacity']


# Сериализатор для регистрации
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
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True, required=False)
    location_id = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), source='location', write_only=True, required=False)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time', 'author', 'location', 
            'category', 'is_public', 'created_at', 'updated_at', 
            'category_id', 'location_id'
        ]

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)