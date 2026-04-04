import uuid
from django.db import models
from django.utils.timesince import timesince


class UserManagement(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("donor", "Donor"),
        ("volunteer", "Volunteer"),
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

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="donor")
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

import uuid
from django.db import models


class DonorProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField("UserManagement", db_column="user_id", on_delete=models.CASCADE)
    country = models.CharField(max_length=120, blank=True, null=True)
    city = models.CharField(max_length=120, blank=True, null=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    donor_type = models.CharField(max_length=50, blank=True, null=True)
    donation_preference = models.CharField(max_length=50, blank=True, null=True)
    donor_note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "donor_profiles"


class VolunteerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField("UserManagement", db_column="user_id", on_delete=models.CASCADE)
    country = models.CharField(max_length=120, blank=True, null=True)
    city = models.CharField(max_length=120, blank=True, null=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    availability = models.JSONField(default=list)
    areas_of_interest = models.JSONField(default=list)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "volunteer_profiles"


class AuthOtp(models.Model):
    PURPOSE_CHOICES = [
        ("signin", "Sign In"),
        ("email_verification", "Email Verification"),
        ("password_reset", "Password Reset"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("UserManagement", db_column="user_id", on_delete=models.CASCADE)
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES)
    otp_request_token = models.UUIDField(default=uuid.uuid4)
    otp_hash = models.CharField(max_length=255)
    email_snapshot = models.EmailField(max_length=255, blank=True, null=True)
    code_last2 = models.CharField(max_length=2, blank=True, null=True)
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)
    used_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "auth_otps"


class AuthSession(models.Model):
    STATUS_CHOICES = [
      ("active", "Active"),
      ("expired", "Expired"),
      ("used", "Used"),
      ("revoked", "Revoked"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("UserManagement", db_column="user_id", on_delete=models.CASCADE)
    session_request_token = models.UUIDField(default=uuid.uuid4)
    session_key_hash = models.CharField(max_length=255, unique=True)
    token_hint = models.CharField(max_length=4, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField()
    last_seen_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    ended_at = models.DateTimeField(blank=True, null=True)
    active_duration_seconds = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict)

    class Meta:
        managed = False
        db_table = "auth_sessions"