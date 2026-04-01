import uuid
from django.db import models
from accounts.models import UserManagement
from needs.models import Need

# Create your models here.
class Donation(models.Model):
    SOURCE_CHOICES = [
        ("admin", "Admin"),
        ("donor", "Donor"),
    ]

    DONATION_TYPE_CHOICES = [
        ("cash", "Cash"),
        ("in_kind", "In Kind"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("received", "Received"),
        ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    donor = models.ForeignKey(
        UserManagement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="donor_id",
        related_name="donations_made",
    )

    need = models.ForeignKey(
        Need,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="need_id",
        related_name="donations",
    )

    recorded_by = models.ForeignKey(
        UserManagement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="recorded_by",
        related_name="donations_recorded",
    )

    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="admin")
    donation_type = models.CharField(max_length=20, choices=DONATION_TYPE_CHOICES)

    item_name = models.TextField(null=True, blank=True)
    item_description = models.TextField(null=True, blank=True)

    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    unit = models.TextField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    donation_date = models.DateField()
    notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "donations"

    def __str__(self):
        if self.donation_type == "cash":
            return f"Cash Donation - {self.amount}"
        return f"In-Kind Donation - {self.item_name}"