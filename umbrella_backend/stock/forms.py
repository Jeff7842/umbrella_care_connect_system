from django import forms
from .models import StockItem


class StockIssueForm(forms.Form):
    stock_item = forms.ModelChoiceField(
        queryset=StockItem.objects.filter(is_active=True).order_by("name")
    )
    quantity = forms.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=0.01
    )
    notes = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 3}),
        required=False
    )

class StockAdjustmentForm(forms.Form):
    ADJUSTMENT_TYPE_CHOICES = [
        ("add", "Add Stock"),
        ("remove", "Remove Stock"),
    ]

    stock_item = forms.ModelChoiceField(
        queryset=StockItem.objects.filter(is_active=True).order_by("name")
    )
    adjustment_type = forms.ChoiceField(choices=ADJUSTMENT_TYPE_CHOICES)
    quantity = forms.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=0.01
    )
    notes = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 3}),
        required=False
    )

class StockItemForm(forms.ModelForm):
    class Meta:
        model = StockItem
        fields = [
            "name",
            "description",
            "category",
            "unit",
            "current_quantity",
            "reorder_level",
            "is_active",
        ]
        widgets = {
            "description": forms.Textarea(attrs={"rows": 3}),
        }