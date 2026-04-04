from django.contrib import admin
from .models import CalendarEvent


@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ("title", "start_date", "end_date", "start_time", "end_time", "all_day", "status")
    list_filter = ("status", "all_day", "start_date")
    search_fields = ("title", "description")

# Register your models here.
