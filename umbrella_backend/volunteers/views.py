import json
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Q
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_GET, require_http_methods

from .models import VolunteerEvent, VolunteerProfile, VolunteerSignup


def _json_body(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return {}


def _user_name(user):
    return (
        getattr(user, "name", None)
        or f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip()
        or getattr(user, "username", "")
        or getattr(user, "email", "User")
    )


def _is_admin(user):
    return user.is_authenticated and (
        getattr(user, "is_staff", False) or getattr(user, "role", "") == "admin"
    )


def _is_volunteer(user):
    return user.is_authenticated and getattr(user, "role", "") == "volunteer"


@login_required
@require_GET
def volunteer_opportunities_api(request):
    if not _is_volunteer(request.user) and not _is_admin(request.user):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    events = VolunteerEvent.objects.filter(
        is_active=True,
        event_date__gte=timezone.now()
    ).annotate(
        signup_count=Count("signups", filter=~Q(signups__status=VolunteerSignup.Status.CANCELLED))
    ).order_by("event_date")

    data = []
    current_profile = getattr(request.user, "volunteer_profile", None)

    for event in events:
        already_signed_up = False
        if current_profile:
            already_signed_up = VolunteerSignup.objects.filter(
                event=event,
                volunteer=current_profile
            ).exists()

        data.append({
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "event_date": event.event_date.isoformat(),
            "location": event.location,
            "slots_total": event.slots_total,
            "slots_taken": event.signup_count,
            "slots_remaining": max(event.slots_total - event.signup_count, 0),
            "already_signed_up": already_signed_up,
        })

    return JsonResponse({"results": data}, status=200)


@login_required
@require_http_methods(["POST"])
def volunteer_signup_api(request, event_id):
    if not _is_volunteer(request.user):
        return JsonResponse({"error": "Only volunteers can sign up"}, status=403)

    profile = getattr(request.user, "volunteer_profile", None)
    if not profile:
        return JsonResponse({"error": "Volunteer profile not found"}, status=400)

    try:
        event = VolunteerEvent.objects.get(id=event_id, is_active=True)
    except VolunteerEvent.DoesNotExist:
        return JsonResponse({"error": "Event not found"}, status=404)

    if event.event_date < timezone.now():
        return JsonResponse({"error": "You cannot sign up for a past event"}, status=400)

    existing = VolunteerSignup.objects.filter(event=event, volunteer=profile).first()
    if existing:
        return JsonResponse({"error": "You already signed up for this event"}, status=400)

    active_signups = VolunteerSignup.objects.filter(
        event=event
    ).exclude(status=VolunteerSignup.Status.CANCELLED).count()

    if active_signups >= event.slots_total:
        return JsonResponse({"error": "No remaining slots for this event"}, status=400)

    signup = VolunteerSignup.objects.create(
        event=event,
        volunteer=profile,
        status=VolunteerSignup.Status.CONFIRMED,
    )

    return JsonResponse({
        "message": "Signup successful",
        "signup_id": signup.id,
    }, status=201)


@login_required
@require_GET
def volunteer_history_api(request):
    if not _is_volunteer(request.user):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    profile = getattr(request.user, "volunteer_profile", None)
    if not profile:
        return JsonResponse({"results": []}, status=200)

    signups = VolunteerSignup.objects.filter(
        volunteer=profile
    ).select_related("event").order_by("-event__event_date")

    data = [{
        "id": s.id,
        "event_id": s.event.id,
        "event_title": s.event.title,
        "event_date": s.event.event_date.isoformat(),
        "location": s.event.location,
        "status": s.status,
        "signed_up_at": s.created_at.isoformat(),
    } for s in signups]

    return JsonResponse({"results": data}, status=200)


@login_required
@require_GET
def admin_volunteer_stats_api(request):
    if not _is_admin(request.user):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    total_volunteers = VolunteerProfile.objects.filter(is_active=True).count()
    active_events = VolunteerEvent.objects.filter(
        is_active=True,
        event_date__gte=timezone.now()
    ).count()
    total_signups = VolunteerSignup.objects.exclude(
        status=VolunteerSignup.Status.CANCELLED
    ).count()
    attended_count = VolunteerSignup.objects.filter(
        status=VolunteerSignup.Status.ATTENDED
    ).count()

    return JsonResponse({
        "total_volunteers": total_volunteers,
        "active_events": active_events,
        "total_signups": total_signups,
        "attended_count": attended_count,
    })


@login_required
@require_GET
def admin_volunteers_api(request):
    if not _is_admin(request.user):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    search = request.GET.get("search", "").strip()

    qs = VolunteerProfile.objects.select_related("user").all().order_by("-created_at")
    if search:
        qs = qs.filter(
            Q(user__email__icontains=search) |
            Q(user__username__icontains=search) |
            Q(skills__icontains=search) |
            Q(phone__icontains=search)
        )

    results = []
    for profile in qs:
        results.append({
            "id": profile.id,
            "name": _user_name(profile.user),
            "email": getattr(profile.user, "email", ""),
            "phone": profile.phone,
            "skills": profile.skills,
            "availability": profile.availability,
            "is_active": profile.is_active,
            "signups_count": profile.signups.count(),
            "created_at": profile.created_at.isoformat(),
        })

    return JsonResponse({"results": results}, status=200)


@login_required
@require_http_methods(["GET", "POST"])
def admin_events_api(request):
    if not _is_admin(request.user):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    if request.method == "GET":
        events = VolunteerEvent.objects.annotate(
            signup_count=Count("signups", filter=~Q(signups__status=VolunteerSignup.Status.CANCELLED))
        ).order_by("event_date")

        results = [{
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "event_date": e.event_date.isoformat(),
            "location": e.location,
            "slots_total": e.slots_total,
            "slots_taken": e.signup_count,
            "slots_remaining": max(e.slots_total - e.signup_count, 0),
            "is_active": e.is_active,
        } for e in events]

        return JsonResponse({"results": results}, status=200)

    data = _json_body(request)
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    location = (data.get("location") or "").strip()
    event_date = data.get("event_date")
    slots_total = data.get("slots_total", 0)

    if not title or not event_date:
        return JsonResponse({"error": "Title and event date are required"}, status=400)

    try:
        event_dt = timezone.datetime.fromisoformat(event_date)
        if timezone.is_naive(event_dt):
            event_dt = timezone.make_aware(event_dt, timezone.get_current_timezone())
    except Exception:
        return JsonResponse({"error": "Invalid event date format"}, status=400)

    if event_dt < timezone.now():
        return JsonResponse({"error": "Event date cannot be in the past"}, status=400)

    try:
        slots_total = int(slots_total)
    except (TypeError, ValueError):
        return JsonResponse({"error": "Slots total must be a number"}, status=400)

    if slots_total < 1:
        return JsonResponse({"error": "Slots total must be at least 1"}, status=400)

    event = VolunteerEvent.objects.create(
        title=title,
        description=description,
        location=location,
        event_date=event_dt,
        slots_total=slots_total,
        created_by=request.user,
    )

    return JsonResponse({
        "message": "Volunteer event created successfully",
        "event": {
            "id": event.id,
            "title": event.title,
        }
    }, status=201)


@login_required
@require_GET
def admin_event_signups_api(request, event_id):
    if not _is_admin(request.user):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        event = VolunteerEvent.objects.get(id=event_id)
    except VolunteerEvent.DoesNotExist:
        return JsonResponse({"error": "Event not found"}, status=404)

    signups = event.signups.select_related("volunteer__user").order_by("-created_at")
    results = [{
        "id": s.id,
        "name": _user_name(s.volunteer.user),
        "email": getattr(s.volunteer.user, "email", ""),
        "phone": s.volunteer.phone,
        "status": s.status,
        "signed_up_at": s.created_at.isoformat(),
    } for s in signups]

    return JsonResponse({
        "event": {"id": event.id, "title": event.title},
        "results": results,
    })


@login_required
@require_http_methods(["PATCH"])
def admin_signup_status_api(request, signup_id):
    if not _is_admin(request.user):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    data = _json_body(request)
    status_value = data.get("status")

    if status_value not in {
        VolunteerSignup.Status.CONFIRMED,
        VolunteerSignup.Status.CANCELLED,
        VolunteerSignup.Status.ATTENDED,
    }:
        return JsonResponse({"error": "Invalid status"}, status=400)

    try:
        signup = VolunteerSignup.objects.get(id=signup_id)
    except VolunteerSignup.DoesNotExist:
        return JsonResponse({"error": "Signup not found"}, status=404)

    signup.status = status_value
    signup.save(update_fields=["status"])

    return JsonResponse({"message": "Signup status updated"}, status=200)