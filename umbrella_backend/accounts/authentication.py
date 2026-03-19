from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import UserManagement


class DashboardSessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        user_id = request.session.get("user_id")
        if not user_id:
            return None

        try:
            user = UserManagement.objects.get(id=user_id, is_active=True)
        except UserManagement.DoesNotExist:
            raise AuthenticationFailed("Invalid session")

        return (user, None)