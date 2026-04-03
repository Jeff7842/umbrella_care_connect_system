from django.urls import path
from .views import needs_page, needs_api, need_detail_api, close_need_api

urlpatterns = [
    path("", needs_page, name="needs-page"),
    path("api/", needs_api, name="needs-api"),
    path("api/<uuid:need_id>/", need_detail_api, name="need-detail-api"),
    path("api/<uuid:need_id>/close/", close_need_api, name="close-need-api"),
]