from django.urls import path
from .views import (
    index_page,
    auth_page,
    dashboard_page,
    LoginAPIView,
    LogoutAPIView,
    MeAPIView,
    UserListAPIView,
    UserFreezeAPIView,
    UserDeleteAPIView,
)

urlpatterns = [
    path("", index_page, name="index"),
    path("auth/", auth_page, name="auth"),
    path("dashboard/", dashboard_page, name="dashboard"),

    path("api/auth/login/", LoginAPIView.as_view(), name="api-login"),
    path("api/auth/logout/", LogoutAPIView.as_view(), name="api-logout"),
    path("api/auth/me/", MeAPIView.as_view(), name="api-me"),

    path("api/users/", UserListAPIView.as_view(), name="api-users"),
    path("api/users/<uuid:user_id>/freeze/", UserFreezeAPIView.as_view(), name="api-user-freeze"),
    path("api/users/<uuid:user_id>/", UserDeleteAPIView.as_view(), name="api-user-delete"),
]