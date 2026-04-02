from django import forms
from accounts.models import UserManagement
from needs.models import NeedRecord
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
        widgets = {
            "donation_date": forms.DateInput(attrs={"type": "date"}),
            "item_description": forms.Textarea(attrs={"rows": 3}),
            "notes": forms.Textarea(attrs={"rows": 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["donor"].queryset = UserManagement.objects.filter(role="donor").order_by("username")
        self.fields["recorded_by"].queryset = UserManagement.objects.filter(role="admin").order_by("username")
        self.fields["need"].queryset = NeedRecord.objects.all().order_by("title")

    def clean(self):
        cleaned_data = super().clean()

        donation_type = cleaned_data.get("donation_type")
        amount = cleaned_data.get("amount")
        quantity = cleaned_data.get("quantity")
        item_name = cleaned_data.get("item_name")
        unit = cleaned_data.get("unit")
        source = cleaned_data.get("source")
        recorded_by = cleaned_data.get("recorded_by")
        need = cleaned_data.get("need")

        if donation_type == "cash":
            if not amount or amount <= 0:
                self.add_error("amount", "Cash donation amount must be greater than 0.")

            cleaned_data["quantity"] = None
            cleaned_data["item_name"] = None
            cleaned_data["item_description"] = None
            cleaned_data["unit"] = None

        elif donation_type == "in_kind":
            if not quantity or quantity <= 0:
                self.add_error("quantity", "In-kind donation quantity must be greater than 0.")
            if not item_name:
                self.add_error("item_name", "Item name is required for in-kind donations.")
            if not unit:
                self.add_error("unit", "Unit is required for in-kind donations.")

            cleaned_data["amount"] = None

        if source == "admin" and not recorded_by:
            self.add_error("recorded_by", "Admin-recorded donations must have recorded_by set.")

        if source == "donor" and recorded_by:
            self.add_error("recorded_by", "Donor-submitted donations should not have recorded_by set.")

        if need and donation_type and need.need_type != donation_type:
            self.add_error(
                "need",
                f"This need accepts {need.get_need_type_display().lower()} donations, not {donation_type.replace('_', ' ')}."
            )

        return cleaned_data