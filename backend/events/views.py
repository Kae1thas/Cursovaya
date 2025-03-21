from rest_framework import viewsets
from rest_framework.views import APIView
from .models import Event
from .serializers import EventSerializer
from .serializers import RegisterSerializer
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Пользователь успешно создан'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if not serializer.is_valid():
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