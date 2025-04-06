from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Event, Category, Location, Request, UserProfile
from .serializers import EventSerializer, CategorySerializer, LocationSerializer, RequestSerializer, RegisterSerializer, UserSerializer
from .permissions import RoleBasedPermission, IsRoleAdmin
from rest_framework.permissions import IsAdminUser

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [RoleBasedPermission]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        profile = UserProfile.objects.get(user=self.request.user)
        if profile.role == 'user':
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

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        profile = UserProfile.objects.get(user=self.request.user)
        if profile.role not in ['moderator', 'admin']:
            return Response({"error": "Нет прав для обработки заявки"}, status=status.HTTP_403_FORBIDDEN)

        instance = serializer.save(reviewed_by=self.request.user)
        if instance.status == 'approved':
            data = instance.data
            try:
                if instance.request_type == 'event':
                    if instance.action == 'create':
                        event = Event.objects.create(
                            title=data.get('title'),
                            description=data.get('description', ''),
                            start_time=data.get('start_time'),
                            end_time=data.get('end_time'),
                            author=instance.user,
                            is_public=data.get('is_public', True),
                            location_id=data.get('location_id'),
                            category_id=data.get('category_id')
                        )
                        return Response(EventSerializer(event).data, status=status.HTTP_201_CREATED)
                    elif instance.action == 'update':
                        event = instance.event
                        if event.author != instance.user:
                            return Response({"error": "Можно редактировать только свои мероприятия"}, status=status.HTTP_403_FORBIDDEN)
                        event.title = data.get('title', event.title)
                        event.description = data.get('description', event.description)
                        event.start_time = data.get('start_time', event.start_time)
                        event.end_time = data.get('end_time', event.end_time)
                        event.location_id = data.get('location_id', event.location_id)
                        event.category_id = data.get('category_id', event.category_id)
                        event.is_public = data.get('is_public', event.is_public)
                        event.save()
                        return Response(EventSerializer(event).data, status=status.HTTP_200_OK)
                    elif instance.action == 'delete':
                        event = instance.event
                        if event.author != instance.user:
                            return Response({"error": "Можно удалять только свои мероприятия"}, status=status.HTTP_403_FORBIDDEN)
                        event.delete()
                        return Response(status=status.HTTP_204_NO_CONTENT)
                elif instance.request_type == 'category' and instance.action == 'create':
                    category = Category.objects.create(
                        name=data.get('name'),
                        slug=data.get('name', '').lower().replace(' ', '-')
                    )
                    return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)
                elif instance.request_type == 'location' and instance.action == 'create':
                    location = Location.objects.create(
                        name=data.get('name'),
                        city=data.get('city', None)
                    )
                    return Response(LocationSerializer(location).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            UserProfile.objects.get_or_create(user=user, defaults={'role': 'user'})
            return Response({'message': 'Пользователь успешно создан'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    EventViewSet
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().select_related('userprofile')
    serializer_class = UserSerializer
    permission_classes = [IsRoleAdmin]

    def list(self, request, *args, **kwargs):
        print("UserViewSet list method called")
        response = super().list(request, *args, **kwargs)
        print("Response data:", response.data)
        return response

class UpdateUserRoleView(APIView):
    permission_classes = [IsRoleAdmin]
    def patch(self, request, user_id):
        user = User.objects.get(id=user_id)
        role = request.data.get("role")
        print(f"Before: User {user.id}, Role: {user.userprofile.role}")
        if role in ["user", "moderator", "admin"]:
            user.userprofile.role = role
            user.userprofile.save()
            print(f"After: User {user.id}, Role: {user.userprofile.role}")
            return Response({"message": f"Роль изменена на {role}"})
        return Response({"error": "Недопустимая роль"}, status=status.HTTP_400_BAD_REQUEST)

def event_list(request):
    events = Event.objects.all()
    return render(request, 'events/event_list.html', {'events': events})

def event_detail(request, event_id):
    event = Event.objects.get(id=event_id)
    start_time = event.start_time.strftime('%b. %d, %Y, %I:%M %p')
    end_time = event.end_time.strftime('%b. %d, %Y, %I:%M %p')
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
        return Response({
            'role': profile.role,
            'username': request.user.username
        }, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({
            'role': 'user',
            'username': request.user.username
        }, status=status.HTTP_200_OK)