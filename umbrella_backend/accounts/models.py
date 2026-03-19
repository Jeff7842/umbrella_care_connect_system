import uuid
from django.db import models
from django.utils.timesince import timesince


class UserManagement(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("super-admin", "Super Admin"),
        ("staff", "Staff"),
        ("auditor", "Auditor"),
        ("communications", "Communications"),
        ("director", "Director"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("paused", "Paused"),
        ("terminated", "Terminated"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    full_name = models.CharField(max_length=220, editable=False)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    password_hash = models.CharField(max_length=255)
    profile_photo = models.TextField(blank=True, null=True)
    reg_code = models.CharField(max_length=20, unique=True)

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="staff")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="paused")
    verified = models.BooleanField(default=False)

    current_session_key = models.CharField(max_length=255, blank=True, null=True)
    last_seen = models.DateTimeField(blank=True, null=True)
    sign_in_count = models.IntegerField(default=0)
    forgot_password_change_count = models.IntegerField(default=0)

    is_active = models.BooleanField(default=True)
    suspended_at = models.DateTimeField(blank=True, null=True)
    terminated_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    verified_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "user_management"
        ordering = ["-created_at"]

    @property
    def last_seen_human(self):
        if not self.last_seen:
            return "-"
        return f"{timesince(self.last_seen)} ago"

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return self.username