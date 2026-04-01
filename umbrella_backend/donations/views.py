from django.shortcuts import render, redirect
from .models import Donation
from .forms import DonationForm

# Create your views here.

def donation_list_view(request):
    donations = Donation.objects.all().order_by("-created_at")
    return render(request, "donations/donation_list.html", {"donations": donations})


def donation_create_view(request):
    if request.method == "POST":
        form = DonationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("donation_list")
    else:
        form = DonationForm()

    return render(request, "donations/donation_form.html", {"form": form})