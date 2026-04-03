from django.urls import path
from .views import (
    index_page,
    signin_page,
    signup_page,
    dashboard_view,
    #LoginAPIView,
    #LogoutAPIView,
    #MeAPIView,
    UserListCreateAPIView,
    UserDetailAPIView,
    UserFreezeAPIView,
)

urlpatterns = [
    path("", index_page, name="index"),
    path("signin/", signin_page, name="signin"),
    path("signup/", signup_page, name="signup"),
    path("dashboard/", dashboard_view, name="dashboard"),

    #//*path("api/auth/login/", LoginAPIView.as_view(), name="api-login"),
    #//path("api/auth/logout/", LogoutAPIView.as_view(), name="api-logout"),
    #//path("api/auth/me/", MeAPIView.as_view(), name="api-me"),#

    path("api/users/", UserListCreateAPIView.as_view(), name="api-users"),
    path("api/users/<uuid:user_id>/", UserDetailAPIView.as_view(), name="api-user-detail"),
    path("api/users/<uuid:user_id>/freeze/", UserFreezeAPIView.as_view(), name="api-user-freeze"),
]