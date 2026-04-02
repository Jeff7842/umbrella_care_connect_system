from django.urls import path
from .views import stock_list_view, stock_issue_view, stock_adjust_view

urlpatterns = [
    path("", stock_list_view, name="stock_list"),
    path("issue/", stock_issue_view, name="stock_issue"),
    path("adjust/", stock_adjust_view, name="stock_adjust"),
]