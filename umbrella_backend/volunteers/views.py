import json
from django.db.models import Count, Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
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


def _is_authenticated_user(request):
    return hasattr(request, "user") and getattr(request.user, "is_authenticated", False)


# -----------------------------
# Volunteer-facing endpoints
# Keep these role checks for later proper auth work
# -----------------------------
@require_GET
def volunteer_opportunities_api(request):
    events = VolunteerEvent.objects.filter(
        is_active=True,
        event_date__gte=timezone.now()
    ).annotate(
        signup_count=Count("signups", filter=~Q(signups__status=VolunteerSignup.Status.CANCELLED))
    ).order_by("event_date")

    data = []
    current_profile = getattr(request.user, "volunteer_profile", None) if _is_authenticated_user(request) else None

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


@require_http_methods(["POST"])
def volunteer_signup_api(request, event_id):
    if not _is_authenticated_user(request):
        return JsonResponse({"error": "Authentication required"}, status=401)

    if getattr(request.user, "role", "") != "volunteer":
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


@require_GET
def volunteer_history_api(request):
    if not _is_authenticated_user(request):
        return JsonResponse({"error": "Authentication required"}, status=401)

    if getattr(request.user, "role", "") != "volunteer":
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


# -----------------------------
# Admin-facing endpoints
# DEV STYLE: open like your user APIs for now
# -----------------------------
@require_GET
def admin_volunteer_stats_api(request):
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
    }, status=200)


@require_GET
def admin_volunteers_api(request):
    search = request.GET.get("search", "").strip()

    qs = VolunteerProfile.objects.select_related("user").all().order_by("-created_at")
    if search:
        qs = qs.filter(
            Q(user__email__icontains=search) |
            Q(user__username__icontains=search) |
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(skills__icontains=search) |
            Q(phone__icontains=search)
        )

    results = []
    for profile in qs:
        results.append({
            "id": profile.id,
            "name": _user_name(profile.user),
            "first_name": getattr(profile.user, "first_name", ""),
            "last_name": getattr(profile.user, "last_name", ""),
            "email": getattr(profile.user, "email", ""),
            "phone": profile.phone,
            "skills": profile.skills,
            "availability": profile.availability,
            "is_active": profile.is_active,
            "signups_count": profile.signups.count(),
            "created_at": profile.created_at.isoformat(),
        })

    return JsonResponse({"results": results}, status=200)


@require_http_methods(["GET", "PATCH", "DELETE"])
def admin_volunteer_detail_api(request, volunteer_id):
    profile = get_object_or_404(
        VolunteerProfile.objects.select_related("user"),
        id=volunteer_id
    )

    if request.method == "GET":
        return JsonResponse({
            "id": profile.id,
            "name": _user_name(profile.user),
            "first_name": getattr(profile.user, "first_name", ""),
            "last_name": getattr(profile.user, "last_name", ""),
            "email": getattr(profile.user, "email", ""),
            "phone": profile.phone,
            "skills": profile.skills,
            "availability": profile.availability,
            "is_active": profile.is_active,
            "signups_count": profile.signups.count(),
            "created_at": profile.created_at.isoformat(),
        }, status=200)

    if request.method == "PATCH":
        data = _json_body(request)

        first_name = (data.get("first_name") or "").strip()
        last_name = (data.get("last_name") or "").strip()
        email = (data.get("email") or "").strip()

        if email:
            existing = profile.user.__class__.objects.filter(email=email).exclude(pk=profile.user.pk).exists()
            if existing:
                return JsonResponse({"error": "Email already exists"}, status=400)
            profile.user.email = email

        if hasattr(profile.user, "first_name"):
            profile.user.first_name = first_name
        if hasattr(profile.user, "last_name"):
            profile.user.last_name = last_name

        profile.user.save()

        profile.phone = (data.get("phone") or "").strip()
        profile.skills = (data.get("skills") or "").strip()
        profile.availability = (data.get("availability") or "").strip()
        profile.save()

        return JsonResponse({"message": "Volunteer updated successfully"}, status=200)

    profile.user.delete()
    return JsonResponse({"message": "Volunteer deleted successfully"}, status=200)


@require_http_methods(["PATCH"])
def admin_volunteer_freeze_api(request, volunteer_id):
    profile = get_object_or_404(VolunteerProfile, id=volunteer_id)

    data = _json_body(request)
    requested = data.get("is_active")

    if requested is None:
        profile.is_active = not profile.is_active
    else:
        profile.is_active = bool(requested)

    profile.save(update_fields=["is_active"])

    if hasattr(profile.user, "is_active"):
        profile.user.is_active = profile.is_active
        profile.user.save(update_fields=["is_active"])

    return JsonResponse({
        "message": "Volunteer status updated successfully",
        "is_active": profile.is_active,
    }, status=200)


@require_http_methods(["GET", "POST"])
def admin_events_api(request):
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

    created_by = request.user if _is_authenticated_user(request) else None

    event = VolunteerEvent.objects.create(
        title=title,
        description=description,
        location=location,
        event_date=event_dt,
        slots_total=slots_total,
        created_by=created_by,
    )

    return JsonResponse({
        "message": "Volunteer event created successfully",
        "event": {
            "id": event.id,
            "title": event.title,
        }
    }, status=201)


@require_GET
def admin_event_signups_api(request, event_id):
    event = get_object_or_404(VolunteerEvent, id=event_id)

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
    }, status=200)


@require_http_methods(["PATCH"])
def admin_signup_status_api(request, signup_id):
    data = _json_body(request)
    status_value = data.get("status")

    if status_value not in {
        VolunteerSignup.Status.CONFIRMED,
        VolunteerSignup.Status.CANCELLED,
        VolunteerSignup.Status.ATTENDED,
    }:
        return JsonResponse({"error": "Invalid status"}, status=400)

    signup = get_object_or_404(VolunteerSignup, id=signup_id)
    signup.status = status_value
    signup.save(update_fields=["status"])

    return JsonResponse({"message": "Signup status updated"}, status=200)