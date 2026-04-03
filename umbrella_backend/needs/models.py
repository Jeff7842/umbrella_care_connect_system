import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone


class Need(models.Model):
    class PriorityChoices(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    class StatusChoices(models.TextChoices):
        ACTIVE = "active", "Active"
        PENDING = "pending", "Pending"
        PARTIAL = "partially_funded", "Partially Funded"
        FULFILLED = "fulfilled", "Fulfilled"
        EXPIRED = "expired", "Expired"
        CLOSED = "closed", "Closed"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    quantity_required = models.PositiveIntegerField()
    quantity_fulfilled = models.PositiveIntegerField(default=0)
    priority = models.CharField(
        max_length=20,
        choices=PriorityChoices.choices,
        default=PriorityChoices.MEDIUM,
    )
    deadline = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE,
    )
    posted_by_name = models.CharField(max_length=150, blank=True, null=True)
    is_closed = models.BooleanField(default=False)
    closed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def quantity_remaining(self):
        return max(self.quantity_required - self.quantity_fulfilled, 0)

    def clean(self):
        if self.quantity_required <= 0:
            raise ValidationError("Quantity required must be greater than 0.")
        if self.quantity_fulfilled > self.quantity_required:
            raise ValidationError("Quantity fulfilled cannot be greater than quantity required.")

    def update_status(self):
        if self.is_closed:
            self.status = self.StatusChoices.CLOSED
        elif self.quantity_fulfilled == 0:
            self.status = self.StatusChoices.ACTIVE
        elif self.quantity_fulfilled < self.quantity_required:
            self.status = self.StatusChoices.PARTIAL
        else:
            self.status = self.StatusChoices.FULFILLED

    def save(self, *args, **kwargs):
        if self.is_closed and not self.closed_at:
            self.closed_at = timezone.now()
        if not self.is_closed:
            self.closed_at = None

        self.full_clean()
        self.update_status()
        super().save(*args, **kwargs)


class NeedRecord(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("active", "Active"),
        ("partially_funded", "Partially Funded"),
        ("fulfilled", "Fulfilled"),
        ("expired", "Expired"),
        ("closed", "Closed"),
    ]

    NEED_TYPE_CHOICES = [
        ("cash", "Cash"),
        ("in_kind", "In Kind"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    needs_registration_code = models.TextField(unique=True)
    title = models.TextField()
    date = models.DateField(default=timezone.now)
    description = models.TextField(null=True, blank=True)

    amount_needed = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_received = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    donors = models.JSONField(default=list, blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="pending")

    expiring_at = models.DateTimeField(null=True, blank=True)
    image_url = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    need_type = models.CharField(max_length=20, choices=NEED_TYPE_CHOICES, default="in_kind")
    unit = models.TextField(default="units")

    class Meta:
        managed = False
        db_table = "needs"

    def __str__(self):
        return self.title