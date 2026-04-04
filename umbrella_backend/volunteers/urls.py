from django.urls import path
from .views import (
    volunteer_opportunities_api,
    volunteer_signup_api,
    volunteer_history_api,
    admin_volunteer_stats_api,
    admin_volunteers_api,
    admin_volunteer_detail_api,
    admin_volunteer_freeze_api,
    admin_events_api,
    admin_event_signups_api,
    admin_signup_status_api,
)

urlpatterns = [
    path("api/volunteer/events/", volunteer_opportunities_api, name="volunteer-events-api"),
    path("api/volunteer/events/<int:event_id>/signup/", volunteer_signup_api, name="volunteer-signup-api"),
    path("api/volunteer/history/", volunteer_history_api, name="volunteer-history-api"),

    path("api/volunteers/stats/", admin_volunteer_stats_api, name="admin-volunteer-stats-api"),
    path("api/volunteers/", admin_volunteers_api, name="admin-volunteer-list-api"),
    path("api/volunteers/<int:volunteer_id>/", admin_volunteer_detail_api, name="admin-volunteer-detail-api"),
    path("api/volunteers/<int:volunteer_id>/freeze/", admin_volunteer_freeze_api, name="admin-volunteer-freeze-api"),
    path("api/volunteers/events/", admin_events_api, name="admin-volunteer-events-api"),
    path("api/volunteers/events/<int:event_id>/signups/", admin_event_signups_api, name="admin-event-signups-api"),
    path("api/volunteers/signups/<int:signup_id>/status/", admin_signup_status_api, name="admin-signup-status-api"),
]