import uuid
from django.db import models

class CalendarEvent(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("tentative", "Tentative"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    all_day = models.BooleanField(default=False)
    color = models.CharField(max_length=20, default="#2563eb")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    position = models.IntegerField(default=0)
    created_by = models.UUIDField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "calendar_events"
        ordering = ["start_date", "start_time", "position", "created_at"]

    def __str__(self):
        return self.title