from django.contrib import admin
from .models import StockItem, StockTransaction

# Register your models here.

@admin.register(StockItem)
class StockItemAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "unit", "current_quantity", "reorder_level", "is_active", "updated_at")
    search_fields = ("name", "category")
    list_filter = ("is_active",)


@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    list_display = ("stock_item", "transaction_type", "source", "quantity", "balance_after", "created_at")
    search_fields = ("stock_item__name", "notes")
    list_filter = ("transaction_type", "source", "created_at")