from rest_framework import serializers
from .models import StockItem, StockTransaction


class StockItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockItem
        fields = [
            "id",
            "name",
            "description",
            "category",
            "unit",
            "current_quantity",
            "reorder_level",
            "is_active",
            "created_at",
            "updated_at",
            "stock_no",
            "reg_code",
        ]


class StockTransactionSerializer(serializers.ModelSerializer):
    stock_item_name = serializers.CharField(source="stock_item.name", read_only=True)
    transaction_type_display = serializers.SerializerMethodField()
    source_display = serializers.SerializerMethodField()

    class Meta:
        model = StockTransaction
        fields = [
            "id",
            "transaction_type",
            "transaction_type_display",
            "source",
            "source_display",
            "quantity",
            "balance_after",
            "notes",
            "created_at",
            "stock_item_id",
            "stock_item_name",
            "created_by",
            "donation",
            "need",
        ]

    def get_transaction_type_display(self, obj):
        return obj.get_transaction_type_display()

    def get_source_display(self, obj):
        return obj.get_source_display()