from django.conf import settings
from django.db import models
from django.utils import timezone


class VolunteerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="volunteer_profile",
    )
    phone = models.CharField(max_length=20, blank=True)
    skills = models.TextField(blank=True)
    availability = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return getattr(self.user, "email", str(self.user))


class VolunteerEvent(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    slots_total = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_volunteer_events",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def slots_taken(self):
        return self.signups.exclude(status=VolunteerSignup.Status.CANCELLED).count()

    @property
    def slots_remaining(self):
        remaining = self.slots_total - self.slots_taken
        return remaining if remaining > 0 else 0

    @property
    def is_past(self):
        return self.event_date < timezone.now()

    def __str__(self):
        return self.title


class VolunteerSignup(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        ATTENDED = "attended", "Attended"

    event = models.ForeignKey(
        VolunteerEvent,
        on_delete=models.CASCADE,
        related_name="signups",
    )
    volunteer = models.ForeignKey(
        VolunteerProfile,
        on_delete=models.CASCADE,
        related_name="signups",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CONFIRMED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["event", "volunteer"],
                name="unique_volunteer_event_signup",
            )
        ]

    def __str__(self):
        return f"{self.volunteer} -> {self.event}"