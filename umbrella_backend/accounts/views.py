from django.shortcuts import render
from django.utils import timezone
from django.db.models import Q, F
from django.contrib.sessions.backends.db import SessionStore
from django.shortcuts import render, get_object_or_404

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

class UserChangePasswordAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, user_id):
        user = get_object_or_404(UserManagement, id=user_id, is_active=True)

        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not current_password or not new_password:
            return Response({"message": "Current password and new password are required."}, status=400)

        if len(new_password) < 8:
            return Response({"message": "New password must be at least 8 characters."}, status=400)

        stored_hash = (user.password_hash or "").encode("utf-8")
        current_password_bytes = current_password.encode("utf-8")

        try:
            password_matches = bcrypt.checkpw(current_password_bytes, stored_hash)
        except Exception:
            password_matches = False

        if not password_matches:
            return Response({"message": "Current password is incorrect."}, status=400)

        new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user.password_hash = new_hash
        user.updated_at = timezone.now()
        user.save(update_fields=["password_hash", "updated_at"])

        return Response({"message": "Password updated successfully."}, status=200)

    import hashlib
import hmac
import secrets
import string
import uuid
from datetime import timedelta

from django.conf import settings
from django.db import transaction, connection
from django.db.models import Q
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import UserManagement, DonorProfile, VolunteerProfile, AuthOtp, AuthSession

import bcrypt

try:
    from resend import Resend
except Exception:
    Resend = None


OTP_LIFETIME_MINUTES = 15
SESSION_LIFETIME_MINUTES = 30
SESSION_TOKEN_LENGTH = 16


def _hash_value(raw_value: str) -> str:
    secret = (getattr(settings, "SECRET_KEY", "") or "fallback-secret").encode("utf-8")
    return hmac.new(secret, raw_value.encode("utf-8"), hashlib.sha256).hexdigest()


def _generate_otp_code() -> str:
    return "".join(secrets.choice(string.digits) for _ in range(6))


def _generate_session_token(length: int = SESSION_TOKEN_LENGTH) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def _generate_reg_code(first_name: str, role: str) -> str:
    return "UCC" + "".join(secrets.choice(string.digits) for _ in range(4)) + "/" + (first_name[:1] or "U").upper() + (role[:1] or "D").upper()


def _send_email_otp(email: str, code: str, purpose: str):
    if not Resend or not getattr(settings, "RESEND_API_KEY", None):
        return

    resend = Resend(api_key=settings.RESEND_API_KEY)

    subject_map = {
        "signin": "Your Umbrella Care Connect sign-in code",
        "email_verification": "Verify your Umbrella Care Connect email",
        "password_reset": "Your password reset code",
    }

    action_map = {
        "signin": "sign in",
        "email_verification": "verify your email",
        "password_reset": "reset your password",
    }

    subject = subject_map.get(purpose, "Your Umbrella Care Connect code")
    action = action_map.get(purpose, "continue")

    html = f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fffdf8;color:#1f2a3a">
      <h2 style="margin:0 0 12px;color:#1f2a3a;">Umbrella Care Connect</h2>
      <p style="font-size:16px;line-height:1.7;">Use the code below to {action}.</p>
      <div style="margin:24px 0;padding:18px 20px;background:#fff1d5;border-radius:16px;text-align:center;">
        <div style="font-size:32px;font-weight:800;letter-spacing:10px;color:#835500;">{code}</div>
      </div>
      <p style="font-size:14px;line-height:1.7;color:#6f7785;">This code expires in 15 minutes. Ignore this email if this was not you.</p>
    </div>
    """

    resend.emails.send({
        "from": getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@umbrellacareconnect.com"),
        "to": [email],
        "subject": subject,
        "html": html,
    })


def _deactivate_existing_otps(user, purpose):
    AuthOtp.objects.filter(
        user=user,
        purpose=purpose,
        is_active=True,
        used_at__isnull=True
    ).update(is_active=False, updated_at=timezone.now())


def _create_otp(user, purpose):
    _deactivate_existing_otps(user, purpose)

    code = _generate_otp_code()
    now = timezone.now()
    otp = AuthOtp.objects.create(
        user=user,
        purpose=purpose,
        otp_hash=_hash_value(code),
        email_snapshot=user.email,
        code_last2=code[-2:],
        expires_at=now + timedelta(minutes=OTP_LIFETIME_MINUTES),
        created_at=now,
        updated_at=now,
    )
    _send_email_otp(user.email, code, purpose)
    return otp


def _expire_user_sessions(user):
    now = timezone.now()
    active_sessions = AuthSession.objects.filter(user=user, is_active=True)
    for session in active_sessions:
        session.is_active = False
        session.status = "expired"
        session.ended_at = now
        session.active_duration_seconds = int((now - session.created_at).total_seconds())
        session.save(update_fields=["is_active", "status", "ended_at", "active_duration_seconds"])


def _create_session_for_user(user, request):
    _expire_user_sessions(user)

    token = _generate_session_token(SESSION_TOKEN_LENGTH)
    now = timezone.now()

    auth_session = AuthSession.objects.create(
        user=user,
        session_key_hash=_hash_value(token),
        token_hint=token[-4:],
        status="active",
        is_active=True,
        created_at=now,
        last_seen_at=now,
        expires_at=now + timedelta(minutes=SESSION_LIFETIME_MINUTES),
        metadata={
            "ip": request.META.get("REMOTE_ADDR"),
            "user_agent": request.META.get("HTTP_USER_AGENT", ""),
        },
    )

    user.current_session_key = auth_session.session_request_token.hex
    user.last_seen = now
    user.sign_in_count = (user.sign_in_count or 0) + 1
    user.updated_at = now
    user.save(update_fields=["current_session_key", "last_seen", "sign_in_count", "updated_at"])

    request.session["user_id"] = str(user.id)
    request.session["auth_session_request_token"] = str(auth_session.session_request_token)
    request.session["session_token"] = token
    request.session.set_expiry(SESSION_LIFETIME_MINUTES * 60)

    return auth_session, token


class AuthSignupAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        data = request.data
        role = (data.get("role") or "donor").strip().lower()

        if role not in ["donor", "volunteer"]:
            return Response({"message": "Invalid role selected."}, status=400)

        first_name = (data.get("first_name") or "").strip()
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "")
        confirm_password = (data.get("confirm_password") or "")

        if not first_name or not username or not email or not password:
            return Response({"message": "Required fields are missing."}, status=400)

        if password != confirm_password:
            return Response({"message": "Passwords do not match."}, status=400)

        if len(password) < 8:
            return Response({"message": "Password must be at least 8 characters."}, status=400)

        if UserManagement.objects.filter(Q(email=email) | Q(username=username)).exists():
            return Response({"message": "Email or username already exists."}, status=400)

        now = timezone.now()
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        with transaction.atomic():
            user = UserManagement.objects.create(
                first_name=first_name,
                last_name=(data.get("last_name") or "").strip() or None,
                full_name=f"{first_name} {(data.get('last_name') or '').strip()}".strip(),
                username=username,
                email=email,
                phone=(data.get("phone") or "").strip() or None,
                password_hash=password_hash,
                reg_code=_generate_reg_code(first_name, role),
                role=role,
                status="paused",
                verified=False,
                is_active=True,
                created_at=now,
                updated_at=now,
                verified_at=None,
            )

            common_country = (data.get("country") or "").strip() or None
            common_city = (data.get("city") or "").strip() or None
            common_gender = (data.get("gender") or "").strip() or None

            if role == "donor":
                donor_profile = data.get("donor_profile") or {}
                DonorProfile.objects.create(
                    user=user,
                    country=common_country,
                    city=common_city,
                    gender=common_gender,
                    donor_type=(donor_profile.get("donor_type") or "").strip() or None,
                    donation_preference=(donor_profile.get("donation_preference") or "").strip() or None,
                    donor_note=(donor_profile.get("donor_note") or "").strip() or None,
                    created_at=now,
                    updated_at=now,
                )
            else:
                volunteer_profile = data.get("volunteer_profile") or {}
                VolunteerProfile.objects.create(
                    user=user,
                    country=common_country,
                    city=common_city,
                    gender=common_gender,
                    skills=(volunteer_profile.get("skills") or "").strip() or None,
                    availability=volunteer_profile.get("availability") or [],
                    areas_of_interest=volunteer_profile.get("areas_of_interest") or [],
                    created_at=now,
                    updated_at=now,
                )

            otp = _create_otp(user, "email_verification")

        return Response({
            "message": f"We sent a 6-digit verification code to {user.email}. Verify your email before signing in.",
            "otp_request_token": str(otp.otp_request_token),
            "expires_at": otp.expires_at.isoformat(),
        }, status=201)


class AuthSignupVerifyEmailAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        otp_request_token = request.data.get("otp_request_token")
        code = (request.data.get("code") or "").strip()

        if not otp_request_token or len(code) != 6:
            return Response({"message": "OTP request token and valid code are required."}, status=400)

        try:
            otp = AuthOtp.objects.select_related("user").get(
                otp_request_token=otp_request_token,
                purpose="email_verification",
                is_active=True,
                used_at__isnull=True,
            )
        except AuthOtp.DoesNotExist:
            return Response({"message": "Verification code not found or already used."}, status=404)

        now = timezone.now()

        if otp.expires_at <= now:
            otp.is_active = False
            otp.updated_at = now
            otp.save(update_fields=["is_active", "updated_at"])
            return Response({"message": "Verification code expired."}, status=400)

        if otp.attempts >= otp.max_attempts:
            otp.is_active = False
            otp.updated_at = now
            otp.save(update_fields=["is_active", "updated_at"])
            return Response({"message": "Maximum attempts reached."}, status=400)

        otp.attempts += 1
        otp.updated_at = now
        otp.save(update_fields=["attempts", "updated_at"])

        if _hash_value(code) != otp.otp_hash:
            return Response({"message": "Invalid verification code."}, status=400)

        otp.is_active = False
        otp.used_at = now
        otp.updated_at = now
        otp.save(update_fields=["is_active", "used_at", "updated_at"])

        user = otp.user
        user.verified = True
        user.status = "active"
        user.verified_at = now
        user.updated_at = now
        user.save(update_fields=["verified", "status", "verified_at", "updated_at"])

        return Response({
            "message": "Email verified successfully.",
            "redirect_url": "/signin/",
        })


class AuthSignupResendVerificationOtpAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return Response({"message": "Email is required."}, status=400)

        try:
            user = UserManagement.objects.get(email=email, is_active=True)
        except UserManagement.DoesNotExist:
            return Response({"message": "User not found."}, status=404)

        if user.verified:
            return Response({"message": "This email is already verified."}, status=400)

        otp = _create_otp(user, "email_verification")

        return Response({
            "message": f"A new verification code was sent to {user.email}.",
            "otp_request_token": str(otp.otp_request_token),
            "expires_at": otp.expires_at.isoformat(),
        })


class AuthSigninRequestOtpAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        login = (request.data.get("login") or "").strip()
        password = (request.data.get("password") or "")

        if not login or not password:
            return Response({"message": "Login and password are required."}, status=400)

        try:
            user = UserManagement.objects.get(Q(email__iexact=login) | Q(username__iexact=login), is_active=True)
        except UserManagement.DoesNotExist:
            return Response({"message": "Invalid credentials."}, status=400)

        try:
            is_valid = bcrypt.checkpw(password.encode("utf-8"), (user.password_hash or "").encode("utf-8"))
        except Exception:
            is_valid = False

        if not is_valid:
            return Response({"message": "Invalid credentials."}, status=400)

        if not user.verified:
            return Response({"message": "Verify your email first before signing in."}, status=403)

        if user.status != "active":
            return Response({"message": "This account is not active."}, status=403)

        otp = _create_otp(user, "signin")

        return Response({
            "message": f"We sent a 6-digit sign-in code to {user.email}.",
            "otp_request_token": str(otp.otp_request_token),
            "expires_at": otp.expires_at.isoformat(),
        })


class AuthSigninResendOtpAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        login = (request.data.get("login") or "").strip()
        if not login:
            return Response({"message": "Login is required."}, status=400)

        try:
            user = UserManagement.objects.get(Q(email__iexact=login) | Q(username__iexact=login), is_active=True)
        except UserManagement.DoesNotExist:
            return Response({"message": "User not found."}, status=404)

        if not user.verified:
            return Response({"message": "Verify your email first."}, status=403)

        otp = _create_otp(user, "signin")

        return Response({
            "message": f"A new sign-in code was sent to {user.email}.",
            "otp_request_token": str(otp.otp_request_token),
            "expires_at": otp.expires_at.isoformat(),
        })


class AuthSigninVerifyOtpAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        otp_request_token = request.data.get("otp_request_token")
        code = (request.data.get("code") or "").strip()

        if not otp_request_token or len(code) != 6:
            return Response({"message": "OTP request token and code are required."}, status=400)

        try:
            otp = AuthOtp.objects.select_related("user").get(
                otp_request_token=otp_request_token,
                purpose="signin",
                is_active=True,
                used_at__isnull=True,
            )
        except AuthOtp.DoesNotExist:
            return Response({"message": "OTP not found or already used."}, status=404)

        now = timezone.now()

        if otp.expires_at <= now:
            otp.is_active = False
            otp.updated_at = now
            otp.save(update_fields=["is_active", "updated_at"])
            return Response({"message": "OTP expired."}, status=400)

        if otp.attempts >= otp.max_attempts:
            otp.is_active = False
            otp.updated_at = now
            otp.save(update_fields=["is_active", "updated_at"])
            return Response({"message": "Maximum attempts reached."}, status=400)

        otp.attempts += 1
        otp.updated_at = now
        otp.save(update_fields=["attempts", "updated_at"])

        if _hash_value(code) != otp.otp_hash:
            return Response({"message": "Invalid OTP."}, status=400)

        otp.is_active = False
        otp.used_at = now
        otp.updated_at = now
        otp.save(update_fields=["is_active", "used_at", "updated_at"])

        auth_session, session_token = _create_session_for_user(otp.user, request)

        return Response({
            "message": "Sign in successful.",
            "redirect_url": "/dashboard/",
            "session_request_token": str(auth_session.session_request_token),
            "session_token_hint": auth_session.token_hint,
        })


        from django.shortcuts import render
from django.utils import timezone
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import UserManagement, AuthOtp
from .views import _create_otp, _create_session_for_user, _hash_value  # only if helpers are in same file, otherwise remove this import

import bcrypt


def admin_signin_page(request):
    return render(request, "admin-signin.html")


def admin_otp_page(request):
    return render(request, "admin-otp.html")


class AdminSigninRequestOtpAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        login = (request.data.get("login") or "").strip()
        password = (request.data.get("password") or "")

        if not login or not password:
            return Response({"message": "Admin username and admin key are required."}, status=400)

        try:
            user = UserManagement.objects.get(
                Q(email__iexact=login) | Q(username__iexact=login),
                is_active=True,
                role="admin",
            )
        except UserManagement.DoesNotExist:
            return Response({"message": "Admin account not found."}, status=404)

        try:
            valid_password = bcrypt.checkpw(password.encode("utf-8"), (user.password_hash or "").encode("utf-8"))
        except Exception:
            valid_password = False

        if not valid_password:
            return Response({"message": "Invalid admin credentials."}, status=400)

        if not user.verified:
            return Response({"message": "This admin email is not verified yet."}, status=403)

        if user.status != "active":
            return Response({"message": "This admin account is not active."}, status=403)

        otp = _create_otp(user, "signin")

        return Response({
            "message": f"A 6-digit verification code was sent to {user.email}.",
            "otp_request_token": str(otp.otp_request_token),
            "expires_at": otp.expires_at.isoformat(),
        }, status=200)


class AdminSigninVerifyOtpAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        otp_request_token = request.data.get("otp_request_token")
        code = (request.data.get("code") or "").strip()

        if not otp_request_token or len(code) != 6:
            return Response({"message": "OTP request token and 6-digit code are required."}, status=400)

        try:
            otp = AuthOtp.objects.select_related("user").get(
                otp_request_token=otp_request_token,
                purpose="signin",
                is_active=True,
                used_at__isnull=True,
            )
        except AuthOtp.DoesNotExist:
            return Response({"message": "Admin OTP not found or already used."}, status=404)

        now = timezone.now()

        if otp.expires_at <= now:
            otp.is_active = False
            otp.updated_at = now
            otp.save(update_fields=["is_active", "updated_at"])
            return Response({"message": "Admin OTP expired."}, status=400)

        if otp.user.role != "admin":
            otp.is_active = False
            otp.updated_at = now
            otp.save(update_fields=["is_active", "updated_at"])
            return Response({"message": "Unauthorized OTP scope."}, status=403)

        if otp.attempts >= otp.max_attempts:
            otp.is_active = False
            otp.updated_at = now
            otp.save(update_fields=["is_active", "updated_at"])
            return Response({"message": "Maximum OTP attempts reached."}, status=400)

        otp.attempts += 1
        otp.updated_at = now
        otp.save(update_fields=["attempts", "updated_at"])

        if _hash_value(code) != otp.otp_hash:
            return Response({"message": "Invalid admin verification code."}, status=400)

        otp.is_active = False
        otp.used_at = now
        otp.updated_at = now
        otp.save(update_fields=["is_active", "used_at", "updated_at"])

        _create_session_for_user(otp.user, request)

        return Response({
            "message": "Admin authentication successful.",
            "redirect_url": "/dashboard/",
        }, status=200)


class AdminSigninResendOtpAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        login = (request.data.get("login") or "").strip()

        if not login:
            return Response({"message": "Admin login is required."}, status=400)

        try:
            user = UserManagement.objects.get(
                Q(email__iexact=login) | Q(username__iexact=login),
                is_active=True,
                role="admin",
            )
        except UserManagement.DoesNotExist:
            return Response({"message": "Admin account not found."}, status=404)

        if not user.verified:
            return Response({"message": "This admin email is not verified yet."}, status=403)

        if user.status != "active":
            return Response({"message": "This admin account is not active."}, status=403)

        otp = _create_otp(user, "signin")

        return Response({
            "message": f"A fresh admin OTP was sent to {user.email}.",
            "otp_request_token": str(otp.otp_request_token),
            "expires_at": otp.expires_at.isoformat(),
        }, status=200)