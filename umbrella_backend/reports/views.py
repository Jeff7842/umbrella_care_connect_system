import csv
from datetime import datetime, date

from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.http import JsonResponse, HttpResponse

from donations.models import Donation
from needs.models import NeedRecord
from volunteers.models import VolunteerSignup


def is_admin_user(user):
    return (
        getattr(user, "is_staff", False)
        or getattr(user, "is_superuser", False)
        or getattr(user, "role", "") == "admin"
    )


def admin_required(view_func):
    return login_required(
        user_passes_test(is_admin_user, login_url="/accounts/login/")(view_func)
    )


def parse_date_range(request):
    start_str = request.GET.get("start_date")
    end_str = request.GET.get("end_date")

    today = date.today()
    first_day = today.replace(day=1)

    try:
        start_date = datetime.strptime(start_str, "%Y-%m-%d").date() if start_str else first_day
    except ValueError:
        start_date = first_day

    try:
        end_date = datetime.strptime(end_str, "%Y-%m-%d").date() if end_str else today
    except ValueError:
        end_date = today

    if start_date > end_date:
        start_date, end_date = end_date, start_date

    return start_date, end_date


def build_donations_report(start_date, end_date):
    qs = (
        Donation.objects
        .filter(donation_date__range=[start_date, end_date])
        .select_related("donor", "need")
        .order_by("-donation_date", "-created_at")
    )

    summary = {
        "title": "Donations Report",
        "count": qs.count(),
        "cash_total": qs.filter(donation_type="cash").aggregate(
            total=Coalesce(Sum("amount"), 0)
        )["total"],
        "in_kind_count": qs.filter(donation_type="in_kind").count(),
    }

    headers = [
        "Date", "Donor", "Type", "Amount", "Quantity",
        "Unit", "Need", "Status", "Source"
    ]

    rows = []
    for obj in qs:
        donor_name = (
            getattr(obj.donor, "full_name", None)
            or getattr(obj.donor, "name", None)
            or getattr(obj.donor, "email", None)
            or "Anonymous"
        )

        rows.append([
            str(obj.donation_date),
            donor_name,
            obj.donation_type,
            str(obj.amount) if obj.amount is not None else "-",
            str(obj.quantity) if obj.quantity is not None else "-",
            obj.unit or "-",
            obj.need.title if obj.need else "-",
            obj.status,
            obj.source,
        ])

    return summary, headers, rows


def build_needs_report(start_date, end_date):
    qs = (
        NeedRecord.objects
        .filter(created_at__date__range=[start_date, end_date])
        .order_by("-created_at")
    )

    summary = {
        "title": "Needs Report",
        "count": qs.count(),
        "total_needed": qs.aggregate(total=Coalesce(Sum("amount_needed"), 0))["total"],
        "total_received": qs.aggregate(total=Coalesce(Sum("amount_received"), 0))["total"],
    }

    headers = [
        "Code", "Title", "Type", "Amount Needed",
        "Amount Received", "Unit", "Status", "Created At"
    ]

    rows = []
    for obj in qs:
        rows.append([
            obj.needs_registration_code,
            obj.title,
            obj.need_type,
            str(obj.amount_needed),
            str(obj.amount_received),
            obj.unit or "-",
            obj.status,
            str(obj.created_at),
        ])

    return summary, headers, rows


def build_volunteers_report(start_date, end_date):
    qs = (
        VolunteerSignup.objects
        .filter(created_at__date__range=[start_date, end_date])
        .select_related("event", "volunteer__user")
        .order_by("-created_at")
    )

    summary = {
        "title": "Volunteer Participation Report",
        "count": qs.count(),
        "confirmed_count": qs.filter(status="confirmed").count(),
        "attended_count": qs.filter(status="attended").count(),
    }

    headers = [
        "Volunteer", "Email", "Phone", "Event",
        "Event Date", "Location", "Signup Status", "Signed Up On"
    ]

    rows = []
    for obj in qs:
        user = obj.volunteer.user
        volunteer_name = (
            getattr(user, "full_name", None)
            or getattr(user, "name", None)
            or getattr(user, "email", None)
            or str(user)
        )

        rows.append([
            volunteer_name,
            getattr(user, "email", "-"),
            obj.volunteer.phone or "-",
            obj.event.title,
            str(obj.event.event_date),
            obj.event.location or "-",
            obj.status,
            str(obj.created_at),
        ])

    return summary, headers, rows


def get_report_data(report_type, start_date, end_date):
    if report_type == "needs":
        return build_needs_report(start_date, end_date)
    if report_type == "volunteers":
        return build_volunteers_report(start_date, end_date)
    return build_donations_report(start_date, end_date)


@admin_required
def report_data_api(request):
    report_type = request.GET.get("report_type", "donations")
    start_date, end_date = parse_date_range(request)

    summary, headers, rows = get_report_data(report_type, start_date, end_date)

    return JsonResponse({
        "report_type": report_type,
        "start_date": str(start_date),
        "end_date": str(end_date),
        "summary": summary,
        "headers": headers,
        "rows": rows,
    })


@admin_required
def report_export_csv(request):
    report_type = request.GET.get("report_type", "donations")
    start_date, end_date = parse_date_range(request)

    _, headers, rows = get_report_data(report_type, start_date, end_date)

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = (
        f'attachment; filename="{report_type}_report_{start_date}_{end_date}.csv"'
    )

    writer = csv.writer(response)
    writer.writerow(headers)
    writer.writerows(rows)

    return response