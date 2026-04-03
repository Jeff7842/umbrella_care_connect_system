import json
from datetime import date, datetime
from functools import wraps
from uuid import UUID

from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from accounts.models import UserManagement
from .models import NeedRecord


def get_current_user(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    return UserManagement.objects.filter(id=user_id, is_active=True).first()


def admin_required_api(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = get_current_user(request)
        if not user:
            return JsonResponse({"error": "Authentication required."}, status=401)
        if user.role != "admin":
            return JsonResponse({"error": "Admin access required."}, status=403)
        request.current_user = user
        return view_func(request, *args, **kwargs)
    return wrapper


@ensure_csrf_cookie
def needs_page(request):
    return render(request, "needs.html")


def serialize_need(need):
    donors_list = need.donors if isinstance(need.donors, list) else []

    return {
        "id": str(need.id),
        "title": need.title,
        "description": need.description,
        "category": need.need_type or "-",
        "quantity_required": float(need.amount_needed),
        "quantity_fulfilled": float(need.amount_received),
        "quantity_remaining": float(need.amount_needed - need.amount_received),
        "priority": "-",  # not present in current Supabase-backed table
        "deadline": need.expiring_at.date().isoformat() if need.expiring_at else None,
        "status": need.status,
        "posted_by_name": None,
        "is_closed": need.status == "closed",
        "closed_at": need.updated_at.isoformat() if need.status == "closed" else None,
        "created_at": need.created_at.isoformat() if need.created_at else None,
        "updated_at": need.updated_at.isoformat() if need.updated_at else None,
        "unit": need.unit,
        "need_type": need.need_type,
        "needs_registration_code": need.needs_registration_code,
        "image_url": need.image_url,
        "donors": donors_list,
        "donors_count": len(donors_list),
        "amount_needed": float(need.amount_needed),
        "amount_received": float(need.amount_received),
    }


def parse_body(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


@require_http_methods(["GET", "POST"])
def needs_api(request):
    if request.method == "GET":
        needs = NeedRecord.objects.all().order_by("-created_at")

        status_value = request.GET.get("status")
        search_value = request.GET.get("search")

        if status_value:
            needs = needs.filter(status=status_value)
        if search_value:
            needs = needs.filter(title__icontains=search_value)

        return JsonResponse({
            "count": needs.count(),
            "results": [serialize_need(n) for n in needs]
        })

    user = get_current_user(request)
    if not user:
        return JsonResponse({"error": "Authentication required."}, status=401)
    if user.role != "admin":
        return JsonResponse({"error": "Admin access required."}, status=403)

    data = parse_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body."}, status=400)

    try:
        expiring_at = None
        if data.get("deadline"):
            expiring_at = datetime.fromisoformat(f"{data['deadline']}T00:00:00")

        need = NeedRecord.objects.create(
            needs_registration_code=data.get("needs_registration_code") or f"NEED-{timezone.now().strftime('%Y%m%d%H%M%S')}",
            title=(data.get("title") or "").strip(),
            description=data.get("description", ""),
            amount_needed=data.get("quantity_required", 0),
            amount_received=data.get("quantity_fulfilled", 0),
            status=data.get("status", "pending"),
            expiring_at=expiring_at,
            need_type=data.get("need_type", "in_kind"),
            unit=data.get("unit", "units"),
            image_url=data.get("image_url", ""),
            donors=data.get("donors", []),
            created_at=timezone.now(),
            updated_at=timezone.now(),
            date=timezone.now().date(),
        )

        return JsonResponse(
            {"message": "Need created successfully.", "need": serialize_need(need)},
            status=201
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@require_http_methods(["GET", "PATCH", "DELETE"])
def need_detail_api(request, need_id):
    need = get_object_or_404(NeedRecord, pk=need_id)

    if request.method == "GET":
        return JsonResponse(serialize_need(need))

    user = get_current_user(request)
    if not user:
        return JsonResponse({"error": "Authentication required."}, status=401)
    if user.role != "admin":
        return JsonResponse({"error": "Admin access required."}, status=403)

    if request.method == "PATCH":
        data = parse_body(request)
        if data is None:
            return JsonResponse({"error": "Invalid JSON body."}, status=400)

        try:
            if "title" in data:
                need.title = (data["title"] or "").strip()
            if "description" in data:
                need.description = data["description"]
            if "quantity_required" in data:
                need.amount_needed = data["quantity_required"]
            if "quantity_fulfilled" in data:
                need.amount_received = data["quantity_fulfilled"]
            if "deadline" in data:
                need.expiring_at = (
                    datetime.fromisoformat(f"{data['deadline']}T00:00:00")
                    if data["deadline"] else None
                )
            if "status" in data:
                need.status = data["status"]
            if "need_type" in data:
                need.need_type = data["need_type"]
            if "unit" in data:
                need.unit = data["unit"]
            if "image_url" in data:
                need.image_url = data["image_url"]
            if "donors" in data and isinstance(data["donors"], list):
                need.donors = data["donors"]

            need.updated_at = timezone.now()
            need.save()

            return JsonResponse({
                "message": "Need updated successfully.",
                "need": serialize_need(need)
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    need.delete()
    return JsonResponse({"message": "Need deleted successfully."})


@require_http_methods(["POST"])
@admin_required_api
def close_need_api(request, need_id):
    need = get_object_or_404(NeedRecord, pk=need_id)
    need.status = "closed"
    need.updated_at = timezone.now()
    need.save()

    return JsonResponse({
        "message": "Need closed successfully.",
        "need": serialize_need(need)
    })