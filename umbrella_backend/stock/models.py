import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from accounts.models import UserManagement

# Create your models here.

class StockItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    unit = models.CharField(max_length=50, default="units")
    stock_no = models.IntegerField(unique=True, null=True, blank=True)
    reg_code = models.CharField(max_length=10, unique=True, null=True, blank=True)

    current_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reorder_level = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "stock_items"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.current_quantity} {self.unit})"

    @property
    def is_low_stock(self):
        return self.current_quantity <= self.reorder_level

    def clean(self):
        if self.current_quantity < 0:
            raise ValidationError("Current quantity cannot be negative.")
        if self.reorder_level < 0:
            raise ValidationError("Reorder level cannot be negative.")


class StockTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ("in", "Stock In"),
        ("out", "Stock Out"),
        ("adjustment", "Adjustment"),
    ]

    SOURCE_CHOICES = [
        ("donation", "Donation"),
        ("issue", "Issue"),
        ("manual", "Manual"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    stock_item = models.ForeignKey(
        StockItem,
        on_delete=models.CASCADE,
        related_name="transactions",
    )

    donation = models.ForeignKey(
        "donations.Donation",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_transactions",
    )

    need = models.ForeignKey(
        "needs.NeedRecord",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_transactions",
    )

    created_by = models.ForeignKey(
        UserManagement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_transactions_created",
    )

    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="manual")

    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "stock_transactions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.stock_item.name} - {self.transaction_type} - {self.quantity}"

    def clean(self):
        if self.quantity <= 0:
            raise ValidationError("Transaction quantity must be greater than zero.")