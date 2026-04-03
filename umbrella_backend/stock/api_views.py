from rest_framework import generics, permissions
from .models import StockItem, StockTransaction
from .serializers import StockItemSerializer, StockTransactionSerializer


class StockItemListAPIView(generics.ListAPIView):
    queryset = StockItem.objects.all().order_by("name")
    serializer_class = StockItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class StockTransactionListAPIView(generics.ListAPIView):
    queryset = StockTransaction.objects.select_related("stock_item").order_by("-created_at")
    serializer_class = StockTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]