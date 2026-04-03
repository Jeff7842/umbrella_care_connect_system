from django.urls import path
from .views import (
    donation_list_view,
    donation_create_view,
    donation_api_list,
    donation_api_stats,
    donation_api_detail,
)

urlpatterns = [
    path("", donation_list_view, name="donation_list"),
    path("new/", donation_create_view, name="donation_create"),

    path("api/donations/", donation_api_list, name="donation_api_list"),
    path("api/donations/stats/", donation_api_stats, name="donation_api_stats"),
    path("api/donations/<uuid:donation_id>/", donation_api_detail, name="donation_api_detail"),
]