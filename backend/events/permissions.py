from rest_framework import permissions
from .models import UserProfile, Event

class RoleBasedPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return view.action == 'list' and hasattr(view, 'queryset') and view.queryset.model == Event

        try:
            profile = UserProfile.objects.get(user=request.user)
            role = profile.role
        except UserProfile.DoesNotExist:
            role = 'user'  # По умолчанию считаем обычным пользователем

        if role == 'user':
            return view.action in ['list', 'retrieve']
        elif role == 'moderator':
            return True
        elif role == 'admin':
            return True
        return False

class CanManageUsers(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            profile = UserProfile.objects.get(user=request.user)
            return profile.role == 'admin'
        except UserProfile.DoesNotExist:
            return False  # Нет профиля — нет админских прав
        

class IsRoleAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            profile = UserProfile.objects.get(user=request.user)
            print(f"Checking permission - User: {request.user}, Role: {profile.role}")
            return profile.role == "admin"
        except UserProfile.DoesNotExist:
            return False