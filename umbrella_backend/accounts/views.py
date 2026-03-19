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


def auth_page(request):
    return render(request, "auth.html")


def dashboard_page(request):
    return render(request, "dashboard.html")


# =========================
# HELPERS
# =========================
def get_logged_in_user(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return None

    try:
        return UserManagement.objects.get(id=user_id, is_active=True)
    except UserManagement.DoesNotExist:
        return None


def require_roles(user, allowed_roles):
    return user is not None and user.role in allowed_roles and user.is_active


# =========================
# AUTH API
# =========================
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = (request.data.get("identifier") or "").strip()
        password = request.data.get("password") or ""

        if not identifier or not password:
            return Response(
                {"detail": "Username/email and password are required."},
                status=400
            )

        user = UserManagement.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier),
            is_active=True
        ).first()

        if not user:
            return Response({"detail": "Invalid login credentials."}, status=401)

        try:
            password_ok = bcrypt.checkpw(
                password.encode("utf-8"),
                user.password_hash.encode("utf-8")
            )
        except Exception:
            return Response(
                {"detail": "Stored password hash format is invalid."},
                status=500
            )

        if not password_ok:
            return Response({"detail": "Invalid login credentials."}, status=401)

        if user.verified is not True or user.status != "active":
            return Response({"detail": "Account is not active yet."}, status=403)

        request.session.flush()
        request.session["user_id"] = str(user.id)
        request.session["role"] = user.role
        request.session.save()

        user.current_session_key = request.session.session_key
        user.last_seen = timezone.now()
        user.sign_in_count = F("sign_in_count") + 1
        user.save(update_fields=["current_session_key", "last_seen", "sign_in_count"])
        user.refresh_from_db()

        return Response({
            "message": "Login successful",
            "user": UserManagementSerializer(user).data,
            "redirect_url": "/dashboard/",
        })


class LogoutAPIView(APIView):
    def post(self, request):
        user = get_logged_in_user(request)

        if user:
            user.current_session_key = None
            user.save(update_fields=["current_session_key"])

        request.session.flush()
        return Response({"message": "Logged out successfully"})


class MeAPIView(APIView):
    def get(self, request):
        user = get_logged_in_user(request)
        if not user:
            return Response({"detail": "Not authenticated"}, status=401)

        user.last_seen = timezone.now()
        user.save(update_fields=["last_seen"])

        return Response(UserManagementSerializer(user).data)


# =========================
# USER MANAGEMENT API
# =========================
class UserListAPIView(APIView):
    def get(self, request):
        actor = get_logged_in_user(request)

        if not require_roles(actor, {"auditor", "director", "admin", "super-admin"}):
            return Response({"detail": "Not allowed"}, status=403)

        search = (request.GET.get("search") or "").strip()
        ordering = request.GET.get("ordering") or "-created_at"
        page = int(request.GET.get("page", 1))
        page_size = int(request.GET.get("page_size", 10))

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

        data = UserManagementSerializer(users, many=True).data
        return Response({
            "count": total,
            "results": data,
        })


class UserFreezeAPIView(APIView):
    def patch(self, request, user_id):
        actor = get_logged_in_user(request)

        if not require_roles(actor, {"admin", "super-admin"}):
            return Response({"detail": "Not allowed"}, status=403)

        try:
            target = UserManagement.objects.get(id=user_id, is_active=True)
        except UserManagement.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        if actor.role == "admin" and target.role == "super-admin":
            return Response({"detail": "Admin cannot freeze super-admin"}, status=403)

        target.status = "paused"
        target.suspended_at = timezone.now()
        target.save(update_fields=["status", "suspended_at", "updated_at"])

        return Response({"message": "User paused successfully"})


class UserDeleteAPIView(APIView):
    def delete(self, request, user_id):
        actor = get_logged_in_user(request)

        if not require_roles(actor, {"super-admin"}):
            return Response({"detail": "Only super-admin can delete users"}, status=403)

        try:
            target = UserManagement.objects.get(id=user_id, is_active=True)
        except UserManagement.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        if str(actor.id) == str(target.id):
            return Response({"detail": "You cannot delete yourself"}, status=400)

        target.is_active = False
        target.status = "terminated"
        target.terminated_at = timezone.now()
        target.save(update_fields=["is_active", "status", "terminated_at", "updated_at"])

        return Response({"message": "User deleted successfully"})