from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from .models import CalendarEvent
from .serializers import CalendarEventSerializer


class CalendarEventViewSet(viewsets.ModelViewSet):
    queryset = CalendarEvent.objects.all().order_by("start_date", "start_time", "position", "created_at")
    serializer_class = CalendarEventSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "status"]
    ordering_fields = ["start_date", "end_date", "start_time", "created_at", "position", "status"]