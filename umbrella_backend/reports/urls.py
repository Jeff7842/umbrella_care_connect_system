from django.urls import path
from . import views

app_name = "reports"

urlpatterns = [
    path("api/reports/", views.report_data_api, name="report-data-api"),
    path("api/reports/export/", views.report_export_csv, name="report-export-csv"),
]