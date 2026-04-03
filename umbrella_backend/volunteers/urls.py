from django.urls import path
from .views import (
    volunteer_opportunities_api,
    volunteer_signup_api,
    volunteer_history_api,
    admin_volunteer_stats_api,
    admin_volunteers_api,
    admin_events_api,
    admin_event_signups_api,
    admin_signup_status_api,
)

urlpatterns = [
    # volunteer-facing
    path("api/volunteer/events/", volunteer_opportunities_api, name="volunteer-events-api"),
    path("api/volunteer/events/<int:event_id>/signup/", volunteer_signup_api, name="volunteer-signup-api"),
    path("api/volunteer/history/", volunteer_history_api, name="volunteer-history-api"),

    # admin-facing
    path("api/volunteers/stats/", admin_volunteer_stats_api, name="admin-volunteer-stats-api"),
    path("api/volunteers/", admin_volunteers_api, name="admin-volunteers-api"),
    path("api/volunteers/events/", admin_events_api, name="admin-volunteer-events-api"),
    path("api/volunteers/events/<int:event_id>/signups/", admin_event_signups_api, name="admin-event-signups-api"),
    path("api/volunteers/signups/<int:signup_id>/status/", admin_signup_status_api, name="admin-signup-status-api"),
]