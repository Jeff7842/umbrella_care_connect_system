from decimal import Decimal, InvalidOperation

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import StockItem, StockTransaction


VALID_DONATION_STATUSES_FOR_STOCK = {"confirmed", "received"}


def _to_decimal(value):
    try:
        return Decimal(str(value or 0))
    except (InvalidOperation, TypeError, ValueError):
        raise ValidationError("Invalid numeric value.")


def _normalize_name(value):
    value = str(value or "").strip()
    return " ".join(value.split()).title()


def _normalize_unit(value):
    value = str(value or "").strip()
    return value if value else "units"


@transaction.atomic
def add_stock_from_donation(donation, user=None):
    """
    Creates stock from an in-kind donation only once.
    Safe to call after every donation save because it checks
    whether stock was already created for that donation.
    """
    if donation.donation_type != "in_kind":
        return None

    if donation.status not in VALID_DONATION_STATUSES_FOR_STOCK:
        return None

    existing_tx = StockTransaction.objects.filter(
        donation=donation,
        transaction_type="in",
    ).first()

    if existing_tx:
        return existing_tx

    quantity = _to_decimal(donation.quantity)
    if quantity <= 0:
        raise ValidationError("In-kind donations must have a quantity greater than 0.")

    item_name = _normalize_name(donation.item_name or donation.item_description or "Unnamed Item")
    unit = _normalize_unit(donation.unit or getattr(donation.need, "unit", None))

    stock_item, _ = StockItem.objects.select_for_update().get_or_create(
        name=item_name,
        defaults={
            "description": donation.item_description,
            "unit": unit,
        },
    )

    fields_to_update = []

    if not stock_item.unit and unit:
        stock_item.unit = unit
        fields_to_update.append("unit")

    if not stock_item.description and donation.item_description:
        stock_item.description = donation.item_description
        fields_to_update.append("description")

    stock_item.current_quantity += quantity
    stock_item.updated_at = timezone.now()
    fields_to_update.extend(["current_quantity", "updated_at"])

    stock_item.full_clean()
    stock_item.save(update_fields=fields_to_update)

    tx = StockTransaction.objects.create(
        stock_item=stock_item,
        donation=donation,
        need=donation.need,
        created_by=user,
        transaction_type="in",
        source="donation",
        quantity=quantity,
        balance_after=stock_item.current_quantity,
        notes=f"Auto-created from donation {donation.id}",
    )

    return tx


@transaction.atomic
def issue_stock(stock_item, quantity, user=None, need=None, notes=""):
    """
    Removes stock from inventory when items are used/issued.
    """
    quantity = _to_decimal(quantity)
    if quantity <= 0:
        raise ValidationError("Issue quantity must be greater than 0.")

    locked_item = StockItem.objects.select_for_update().get(pk=stock_item.pk)

    if locked_item.current_quantity < quantity:
        raise ValidationError("Insufficient stock available.")

    locked_item.current_quantity -= quantity
    locked_item.updated_at = timezone.now()
    locked_item.full_clean()
    locked_item.save(update_fields=["current_quantity", "updated_at"])

    tx = StockTransaction.objects.create(
        stock_item=locked_item,
        need=need,
        created_by=user,
        transaction_type="out",
        source="issue",
        quantity=quantity,
        balance_after=locked_item.current_quantity,
        notes=notes or "Stock issued.",
    )

    return tx


@transaction.atomic
def adjust_stock(stock_item, adjustment_value, user=None, notes=""):
    """
    Positive adjustment_value adds stock.
    Negative adjustment_value removes stock.
    """
    adjustment_value = _to_decimal(adjustment_value)

    if adjustment_value == 0:
        raise ValidationError("Adjustment value cannot be zero.")

    locked_item = StockItem.objects.select_for_update().get(pk=stock_item.pk)

    new_quantity = locked_item.current_quantity + adjustment_value
    if new_quantity < 0:
        raise ValidationError("Adjustment would make stock negative.")

    locked_item.current_quantity = new_quantity
    locked_item.updated_at = timezone.now()
    locked_item.full_clean()
    locked_item.save(update_fields=["current_quantity", "updated_at"])

    direction = "increase" if adjustment_value > 0 else "decrease"

    tx = StockTransaction.objects.create(
        stock_item=locked_item,
        created_by=user,
        transaction_type="adjustment",
        source="manual",
        quantity=abs(adjustment_value),
        balance_after=locked_item.current_quantity,
        notes=notes or f"Manual {direction} adjustment.",
    )

    return tx