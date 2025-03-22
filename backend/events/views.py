from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Event, Category, Location, Request, UserProfile
from .serializers import EventSerializer, CategorySerializer, LocationSerializer, RequestSerializer, RegisterSerializer
from .permissions import RoleBasedPermission, CanManageUsers

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [RoleBasedPermission]

    def perform_create(self, serializer):
        profile = UserProfile.objects.get(user=self.request.user)
        if profile.role == 'user':
            # Создаём заявку вместо прямого создания
            request_data = {
                'request_type': 'event',
                'data': serializer.validated_data,
                'user': self.request.user
            }
            Request.objects.create(**request_data)
        elif profile.role in ['moderator', 'admin']:
            serializer.save(author=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [RoleBasedPermission]

    def perform_create(self, serializer):
        profile = UserProfile.objects.get(user=self.request.user)
        if profile.role == 'user':
            request_data = {
                'request_type': 'category',
                'data': serializer.validated_data,
                'user': self.request.user
            }
            Request.objects.create(**request_data)
        elif profile.role in ['moderator', 'admin']:
            serializer.save()

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [RoleBasedPermission]

    def perform_create(self, serializer):
        profile = UserProfile.objects.get(user=self.request.user)
        if profile.role == 'user':
            request_data = {
                'request_type': 'location',
                'data': serializer.validated_data,
                'user': self.request.user
            }
            Request.objects.create(**request_data)
        elif profile.role in ['moderator', 'admin']:
            serializer.save()

class PublicEventsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        public_events = Event.objects.filter(is_public=True)
        serializer = EventSerializer(public_events, many=True)
        return Response(serializer.data)
    
class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = UserProfile.objects.get(user=self.request.user)
        if profile.role == 'user':
            return Request.objects.filter(user=self.request.user)
        return Request.objects.all()

    def perform_update(self, serializer):
        profile = UserProfile.objects.get(user=self.request.user)
        if profile.role in ['moderator', 'admin']:
            instance = serializer.save(reviewed_by=self.request.user)
            if instance.status == 'approved':
                # Создаём объект на основе данных заявки
                data = instance.data
                if instance.request_type == 'event':
                    Event.objects.create(**data, author=instance.user)
                elif instance.request_type == 'category':
                    Category.objects.create(**data)
                elif instance.request_type == 'location':
                    Location.objects.create(**data)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            UserProfile.objects.get_or_create(user=user, defaults={'role': 'user'})  # Создаём профиль
            return Response({'message': 'Пользователь успешно создан'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def event_list(request):
    events = Event.objects.all()  # Получаем все мероприятия из базы данных
    return render(request, 'events/event_list.html', {'events': events})

def event_detail(request, event_id):
    event = Event.objects.get(id=event_id)
    
    # Форматируем дату для отображения
    start_time = event.start_time.strftime('%b. %d, %Y, %I:%M %p')  # Пример: Feb. 21, 2025, 11:15 AM
    end_time = event.end_time.strftime('%b. %d, %Y, %I:%M %p')  # Пример: Feb. 28, 2025, 11:15 AM
    
    return render(request, 'events/event_detail.html', {
        'event': event,
        'start_time': start_time,
        'end_time': end_time
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_role(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        return Response({'role': profile.role}, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({'role': 'user'}, status=status.HTTP_200_OK)