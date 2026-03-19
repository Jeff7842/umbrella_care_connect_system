from rest_framework import serializers
from .models import UserManagement


class UserManagementSerializer(serializers.ModelSerializer):
    last_seen_human = serializers.CharField(read_only=True)

    class Meta:
        model = UserManagement
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "username",
            "email",
            "phone",
            "profile_photo",
            "reg_code",
            "role",
            "status",
            "verified",
            "last_seen",
            "last_seen_human",
            "created_at",
            "updated_at",
        ]