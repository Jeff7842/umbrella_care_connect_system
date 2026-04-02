from django.contrib import messages
from django.shortcuts import render, redirect
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