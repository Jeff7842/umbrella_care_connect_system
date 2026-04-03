from django.urls import path
from .api_views import StockItemListAPIView, StockTransactionListAPIView

urlpatterns = [
    path("items/", StockItemListAPIView.as_view(), name="api_stock_items"),
    path("transactions/", StockTransactionListAPIView.as_view(), name="api_stock_transactions"),
]