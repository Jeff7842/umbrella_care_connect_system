from django.urls import path
from .views import donation_list_view, donation_create_view

urlpatterns = [
    path("", donation_list_view, name="donation_list"),
    path("new/", donation_create_view, name="donation_create"),
]