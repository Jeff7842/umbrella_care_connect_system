import json
from decimal import Decimal, InvalidOperation

from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q, Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Donation
from .forms import DonationForm
from stock.services import add_stock_from_donation


def donation_list_view(request):
    donations = Donation.objects.select_related("donor", "need", "recorded_by").order_by("-created_at")
    return render(request, "donations/donation_list.html", {"donations": donations})


def donation_create_view(request):
    if request.method == "POST":
        form = DonationForm(request.POST)
        if form.is_valid():
            donation = form.save()

            add_stock_from_donation(
                donation,
                user=request.user if request.user.is_authenticated else None
            )

            messages.success(request, "Donation recorded successfully.")
            return redirect("donation_list")
    else:
        form = DonationForm()

    return render(request, "donations/donation_form.html", {"form": form})


def _to_decimal(value):
    if value in (None, "", "null"):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None


def _get_donor_name(user):
    if not user:
        return "Anonymous Donor"

    first_name = getattr(user, "first_name", "") or ""
    last_name = getattr(user, "last_name", "") or ""
    full_name = f"{first_name} {last_name}".strip()
    return full_name or getattr(user, "username", "") or getattr(user, "email", "") or "Anonymous Donor"


def _get_reference_code(donation):
    reference_code = getattr(donation, "reference_code", None)
    if reference_code:
        return reference_code

    short_id = str(donation.id).replace("-", "").upper()[:10]
    return f"#UCC{short_id}"


def _get_payment_method_value(donation):
    payment_method = getattr(donation, "payment_method", None)
    if payment_method:
        return payment_method

    if donation.donation_type == "in_kind":
        return "in_kind"
    return "cash"


def _get_payment_method_label(payment_method):
    labels = {
        "mpesa": "Mpesa",
        "paypal": "PayPal",
        "credit_card": "Credit Card",
        "bank_transfer": "Bank Transfer",
        "cash": "Cash",
        "in_kind": "In Kind",
    }
    return labels.get(payment_method, str(payment_method).replace("_", " ").title())


def _get_status_label(status):
    labels = {
        "pending": "Pending",
        "confirmed": "Confirmed",
        "received": "Received",
        "cancelled": "Cancelled",
    }
    return labels.get(status, str(status).title())


def _format_amount(donation):
    if donation.donation_type == "cash":
        amount = donation.amount or Decimal("0.00")
        return f"KES {amount:,.2f}"

    quantity = donation.quantity or Decimal("0")
    unit = donation.unit or "units"
    item_name = donation.item_name or "items"
    return f"{quantity} {unit} · {item_name}"


def _format_pledge(donation):
    pledge_amount = getattr(donation, "pledge_amount", None)
    if pledge_amount:
        return f"KES {pledge_amount:,.2f}/month"
    return "-"


def _serialize_donation(donation, row_number=None):
    donor_name = _get_donor_name(donation.donor)
    payment_method = _get_payment_method_value(donation)

    created_source = donation.created_at if donation.created_at else donation.donation_date
    if hasattr(created_source, "tzinfo") and created_source.tzinfo is not None:
        created_text = timezone.localtime(created_source).strftime("%d %b %Y, %I:%M %p")
    else:
        created_text = created_source.strftime("%d %b %Y, %I:%M %p")

    return {
        "id": str(donation.id),
        "row_number": row_number,
        "donor_name": donor_name,
        "row_label": f"{row_number}. {donor_name}" if row_number else donor_name,
        "reference_code": _get_reference_code(donation),
        "email": getattr(donation.donor, "email", "") or "-",
        "method": payment_method,
        "method_label": _get_payment_method_label(payment_method),
        "datetime": created_text,
        "country": getattr(donation, "country", None) or "-",
        "pledge": _format_pledge(donation),
        "amount": _format_amount(donation),
        "status": donation.status,
        "status_label": _get_status_label(donation.status),
        "donation_towards": getattr(donation.need, "title", None) or donation.item_name or "General Donation",
        "comment": donation.notes or donation.item_description or "-",
        "is_favorite": bool(getattr(donation, "is_favorite", False)),
        "avatar_url": "https://i.pravatar.cc/44?img=1",
    }


def _apply_ordering(queryset, ordering):
    ordering_map = {
        "donor_name": "donor__username",
        "email": "donor__email",
        "payment_method": "payment_method",
        "created_at": "created_at",
        "country": "country",
        "pledge_amount": "pledge_amount",
        "amount": "amount",
        "status": "status",
        "need_title": "need__title",
        "notes": "notes",
    }

    base = (ordering or "-created_at").lstrip("-")
    field = ordering_map.get(base, "created_at")
    final_ordering = f"-{field}" if str(ordering).startswith("-") else field
    return queryset.order_by(final_ordering, "-created_at")


@require_http_methods(["GET"])
def donation_api_list(request):
    queryset = Donation.objects.select_related("donor", "need", "recorded_by").all()

    search = request.GET.get("search", "").strip()
    if search:
        queryset = queryset.filter(
            Q(donor__username__icontains=search)
            | Q(donor__email__icontains=search)
            | Q(need__title__icontains=search)
            | Q(item_name__icontains=search)
            | Q(item_description__icontains=search)
            | Q(notes__icontains=search)
            | Q(reference_code__icontains=search)
        )

    status_value = request.GET.get("status", "all").strip()
    if status_value and status_value != "all":
        queryset = queryset.filter(status=status_value)

    method_value = request.GET.get("method", "all").strip()
    if method_value and method_value != "all":
        if method_value == "in_kind":
            queryset = queryset.filter(donation_type="in_kind")
        else:
            queryset = queryset.filter(payment_method=method_value)

    country_value = request.GET.get("country", "all").strip()
    if country_value and country_value != "all":
        queryset = queryset.filter(country__iexact=country_value)

    tab_value = request.GET.get("tab", "latest").strip()
    if tab_value == "favorites":
        queryset = queryset.filter(is_favorite=True)
    elif tab_value == "top":
        queryset = queryset.order_by("-amount", "-created_at")
    else:
        queryset = _apply_ordering(queryset, request.GET.get("ordering", "-created_at"))

    page = max(int(request.GET.get("page", 1) or 1), 1)
    page_size = max(min(int(request.GET.get("page_size", 10) or 10), 100), 1)

    paginator = Paginator(queryset, page_size)
    page_obj = paginator.get_page(page)

    total_count = paginator.count
    start = (page_obj.number - 1) * page_size + 1 if total_count else 0
    end = start + len(page_obj.object_list) - 1 if total_count else 0

    results = [
        _serialize_donation(donation, row_number=start + index)
        for index, donation in enumerate(page_obj.object_list)
    ]

    return JsonResponse({
        "count": total_count,
        "page": page_obj.number,
        "page_size": page_size,
        "num_pages": paginator.num_pages,
        "start": start,
        "end": end,
        "results": results,
    })


@require_http_methods(["GET"])
def donation_api_stats(request):
    today = timezone.now().date()
    month_start = today.replace(day=1)

    successful_statuses = ["confirmed", "received"]

    monthly_total = (
        Donation.objects.filter(
            donation_type="cash",
            donation_date__gte=month_start,
            status__in=successful_statuses,
        ).aggregate(total=Sum("amount"))["total"]
        or Decimal("0.00")
    )

    all_time_total = (
        Donation.objects.filter(
            donation_type="cash",
            status__in=successful_statuses,
        ).aggregate(total=Sum("amount"))["total"]
        or Decimal("0.00")
    )

    distinct_donors = (
        Donation.objects.exclude(donor_id__isnull=True)
        .values("donor_id")
        .distinct()
        .count()
    )

    total_donations = Donation.objects.count()
    successful_donations = Donation.objects.filter(status__in=successful_statuses).count()
    active_goal_percentage = round((successful_donations / total_donations) * 100) if total_donations else 0

    return JsonResponse({
        "monthly_total": f"KES {monthly_total:,.2f}",
        "active_goal_percentage": f"{active_goal_percentage}%",
        "donor_count": distinct_donors,
        "all_time_total": f"KES {all_time_total:,.2f}",
    })


@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
def donation_api_detail(request, donation_id):
    donation = get_object_or_404(
        Donation.objects.select_related("donor", "need", "recorded_by"),
        id=donation_id,
    )

    if request.method == "GET":
        return JsonResponse(_serialize_donation(donation))

    if request.method == "PATCH":
        payload = json.loads(request.body or "{}")

        if "status" in payload and payload["status"] in dict(Donation.STATUS_CHOICES):
            donation.status = payload["status"]

        if "notes" in payload:
            donation.notes = payload["notes"]

        if hasattr(donation, "country") and "country" in payload:
            donation.country = payload["country"] or None

        if hasattr(donation, "payment_method") and "payment_method" in payload:
            donation.payment_method = payload["payment_method"] or None

        if hasattr(donation, "pledge_amount") and "pledge_amount" in payload:
            donation.pledge_amount = _to_decimal(payload["pledge_amount"])

        if hasattr(donation, "is_favorite") and "is_favorite" in payload:
            donation.is_favorite = bool(payload["is_favorite"])

        donation.updated_at = timezone.now()
        donation.save()

        return JsonResponse({
            "success": True,
            "donation": _serialize_donation(donation),
        })

    donation.delete()
    return JsonResponse({"success": True})