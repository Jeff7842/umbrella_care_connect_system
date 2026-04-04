from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.shortcuts import render, redirect

from .forms import StockIssueForm, StockAdjustmentForm, StockItemForm
from .models import StockItem, StockTransaction
from .services import issue_stock, adjust_stock



def stock_list_view(request):
    stock_items = StockItem.objects.all().order_by("name")
    recent_transactions = StockTransaction.objects.select_related(
        "stock_item", "donation", "need", "created_by"
    ).order_by("-created_at")[:10]

    total_items = stock_items.count()
    low_stock_count = sum(1 for item in stock_items if item.is_low_stock)
    out_of_stock_count = sum(1 for item in stock_items if item.current_quantity <= 0)

    context = {
        "stock_items": stock_items,
        "recent_transactions": recent_transactions,
        "total_items": total_items,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
    }

    return render(request, "stock/stock_list.html", context)



def stock_add_view(request):
    if request.method == "POST":
        form = StockItemForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Stock item added successfully.")
            return redirect("stock_list")
    else:
        form = StockItemForm()

    return render(request, "stock/stock_add.html", {"form": form})



def stock_issue_view(request):
    if request.method == "POST":
        form = StockIssueForm(request.POST)
        if form.is_valid():
            stock_item = form.cleaned_data["stock_item"]
            quantity = form.cleaned_data["quantity"]
            notes = form.cleaned_data["notes"]

            try:
                issue_stock(
                    stock_item=stock_item,
                    quantity=quantity,
                    user=None,
                    notes=notes,
                )
                messages.success(request, "Stock issued successfully.")
                return redirect("stock_list")
            except ValidationError as e:
                form.add_error(None, e.messages[0] if hasattr(e, "messages") else str(e))
    else:
        form = StockIssueForm()

    return render(request, "stock/stock_issue.html", {"form": form})



def stock_adjust_view(request):
    if request.method == "POST":
        form = StockAdjustmentForm(request.POST)
        if form.is_valid():
            stock_item = form.cleaned_data["stock_item"]
            adjustment_type = form.cleaned_data["adjustment_type"]
            quantity = form.cleaned_data["quantity"]
            notes = form.cleaned_data["notes"]

            adjustment_value = quantity if adjustment_type == "add" else -quantity

            try:
                adjust_stock(
                    stock_item=stock_item,
                    adjustment_value=adjustment_value,
                    user=None,
                    notes=notes,
                )
                messages.success(request, "Stock adjusted successfully.")
                return redirect("stock_list")
            except ValidationError as e:
                form.add_error(None, e.messages[0] if hasattr(e, "messages") else str(e))
    else:
        form = StockAdjustmentForm()

    return render(request, "stock/stock_adjust.html", {"form": form})