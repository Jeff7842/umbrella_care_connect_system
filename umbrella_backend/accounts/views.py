from django.shortcuts import render
from django.utils import timezone
from django.db.models import Q, F
from django.contrib.sessions.backends.db import SessionStore

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

import bcrypt

from .models import UserManagement
from .serializers import UserManagementSerializer


# =========================
# PAGE VIEWS
# =========================
def index_page(request):
    return render(request, "index.html")


def signin_page(request):
    return render(request, "signin.html")

def signup_page(request):
    return render(request, "signup.html")



from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def dashboard_view(request):
    return render(request, "dashboard.html")


# =========================
# OPEN USER MANAGEMENT API
# DEV ONLY - NO AUTH
# =========================
class UserListCreateAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        search = (request.GET.get("search") or "").strip()
        ordering = request.GET.get("ordering") or "-created_at"

        try:
            page = int(request.GET.get("page", 1))
        except ValueError:
            page = 1

        try:
            page_size = int(request.GET.get("page_size", 10))
        except ValueError:
            page_size = 10

        allowed_ordering = {
            "created_at", "-created_at",
            "full_name", "-full_name",
            "username", "-username",
            "email", "-email",
            "reg_code", "-reg_code",
            "phone", "-phone",
            "role", "-role",
            "status", "-status",
            "last_seen", "-last_seen",
        }

        if ordering not in allowed_ordering:
            ordering = "-created_at"

        qs = UserManagement.objects.filter(is_active=True)

        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(full_name__icontains=search) |
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(reg_code__icontains=search) |
                Q(phone__icontains=search)
            )

        qs = qs.order_by(ordering)

        total = qs.count()
        start = (page - 1) * page_size
        end = start + page_size
        users = qs[start:end]

        serializer = UserManagementSerializer(users, many=True)
        return Response({
            "count": total,
            "results": serializer.data,
        })

    def post(self, request):
        serializer = UserManagementSerializer(data=request.data, partial=False)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserManagementSerializer(user).data, status=201)
        return Response(serializer.errors, status=400)


class UserDetailAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, user_id):
        user = get_object_or_404(UserManagement, id=user_id, is_active=True)
        return Response(UserManagementSerializer(user).data)

    def patch(self, request, user_id):
        user = get_object_or_404(UserManagement, id=user_id, is_active=True)

        serializer = UserManagementSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response(UserManagementSerializer(updated_user).data)
        return Response(serializer.errors, status=400)

    def delete(self, request, user_id):
        user = get_object_or_404(UserManagement, id=user_id, is_active=True)

        user.is_active = False
        user.status = "terminated"
        user.terminated_at = timezone.now()
        user.save(update_fields=["is_active", "status", "terminated_at", "updated_at"])

        return Response({"message": "User deleted successfully"})


class UserFreezeAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def patch(self, request, user_id):
        user = get_object_or_404(UserManagement, id=user_id, is_active=True)

        user.status = "paused"
        user.suspended_at = timezone.now()
        user.save(update_fields=["status", "suspended_at", "updated_at"])

        return Response({"message": "User paused successfully"})