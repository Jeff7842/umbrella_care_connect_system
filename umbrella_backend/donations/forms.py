from django import forms
from .models import Donation


class DonationForm(forms.ModelForm):
    class Meta:
        model = Donation
        fields = [
            "donor",
            "need",
            "recorded_by",
            "source",
            "donation_type",
            "item_name",
            "item_description",
            "amount",
            "quantity",
            "unit",
            "status",
            "donation_date",
            "notes",
        ]

    def clean(self):
        cleaned_data = super().clean()
        donation_type = cleaned_data.get("donation_type")
        amount = cleaned_data.get("amount")
        quantity = cleaned_data.get("quantity")
        item_name = cleaned_data.get("item_name")
        source = cleaned_data.get("source")
        recorded_by = cleaned_data.get("recorded_by")

        if donation_type == "cash":
            if not amount or amount <= 0:
                self.add_error("amount", "Cash donation amount must be greater than 0.")
            cleaned_data["quantity"] = None

        elif donation_type == "in_kind":
            if not quantity or quantity <= 0:
                self.add_error("quantity", "In-kind donation quantity must be greater than 0.")
            if not item_name:
                self.add_error("item_name", "Item name is required for in-kind donations.")
            cleaned_data["amount"] = None

        if source == "admin" and not recorded_by:
            self.add_error("recorded_by", "Admin-recorded donations must have recorded_by set.")

        if source == "donor" and recorded_by:
            self.add_error("recorded_by", "Donor-submitted donations should not have recorded_by set.")

        return cleaned_data