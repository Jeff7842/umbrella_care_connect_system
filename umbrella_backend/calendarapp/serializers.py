from rest_framework import serializers
from .models import CalendarEvent


class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = [
            "id",
            "title",
            "description",
            "start_date",
            "end_date",
            "start_time",
            "end_time",
            "all_day",
            "color",
            "status",
            "position",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        all_day = attrs.get("all_day", getattr(self.instance, "all_day", False))
        start_time = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end_time = attrs.get("end_time", getattr(self.instance, "end_time", None))

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date cannot be before start date.")

        if not all_day and start_time and end_time and end_time < start_time and start_date == end_date:
            raise serializers.ValidationError("End time cannot be before start time on the same day.")

        return attrs