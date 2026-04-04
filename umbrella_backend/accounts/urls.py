from django.urls import path
from .views import (
    index_page,
    signin_page,
    signup_page,
    dashboard_view,
    UserListCreateAPIView,
    UserDetailAPIView,
    UserFreezeAPIView,
    UserChangePasswordAPIView,
    AuthSignupAPIView,
    AuthSignupVerifyEmailAPIView,
    AuthSignupResendVerificationOtpAPIView,
    AuthSigninRequestOtpAPIView,
    AuthSigninVerifyOtpAPIView,
    AuthSigninResendOtpAPIView,
    
)

urlpatterns = [
    path("", index_page, name="index"),
    path("signin/", signin_page, name="signin"),
    path("signup/", signup_page, name="signup"),
    path("dashboard/", dashboard_view, name="dashboard"),

    path("api/users/", UserListCreateAPIView.as_view(), name="api-users"),
    path("api/users/<uuid:user_id>/", UserDetailAPIView.as_view(), name="api-user-detail"),
    path("api/users/<uuid:user_id>/freeze/", UserFreezeAPIView.as_view(), name="api-user-freeze"),
    path("api/users/<uuid:user_id>/change-password/", UserChangePasswordAPIView.as_view(), name="api-user-change-password"),
    path("api/auth/signup/", AuthSignupAPIView.as_view(), name="api-auth-signup"),
    path("api/auth/signup/verify-email/", AuthSignupVerifyEmailAPIView.as_view(), name="api-auth-signup-verify-email"),
    path("api/auth/signup/resend-verification-otp/", AuthSignupResendVerificationOtpAPIView.as_view(), name="api-auth-signup-resend-verification-otp"),
    path("api/auth/signin/request-otp/", AuthSigninRequestOtpAPIView.as_view(), name="api-auth-signin-request-otp"),
    path("api/auth/signin/verify-otp/", AuthSigninVerifyOtpAPIView.as_view(), name="api-auth-signin-verify-otp"),
    path("api/auth/signin/resend-otp/", AuthSigninResendOtpAPIView.as_view(), name="api-auth-signin-resend-otp"),
]


from .views import (
    admin_signin_page,
    admin_otp_page,
    AdminSigninRequestOtpAPIView,
    AdminSigninVerifyOtpAPIView,
    AdminSigninResendOtpAPIView,
)

urlpatterns += [
    path("admin-signin/", admin_signin_page, name="admin-signin"),
    path("admin-otp/", admin_otp_page, name="admin-otp"),

    path("api/admin-auth/signin/request-otp/", AdminSigninRequestOtpAPIView.as_view(), name="api-admin-signin-request-otp"),
    path("api/admin-auth/signin/verify-otp/", AdminSigninVerifyOtpAPIView.as_view(), name="api-admin-signin-verify-otp"),
    path("api/admin-auth/signin/resend-otp/", AdminSigninResendOtpAPIView.as_view(), name="api-admin-signin-resend-otp"),
]
