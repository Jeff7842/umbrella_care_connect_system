from rest_framework import serializers
from .models import UserManagement


class UserManagementSerializer(serializers.ModelSerializer):
    last_seen_human = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)

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
            "password",
        ]
        read_only_fields = [
            "id",
            "full_name",
            "reg_code",
            "created_at",
            "updated_at",
            "last_seen_human",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "Password is required."})

        from django.utils import timezone
        import bcrypt
        import random
        import string

        first_name = validated_data.get("first_name", "")
        role = validated_data.get("role", "donor")

        reg_code = "UCC" + "".join(random.choices(string.digits, k=4)) + "/" + \
                   (first_name[:1].upper() if first_name else "U") + \
                   (role[:1].upper() if role else "D")

        now = timezone.now()
        validated_data["password_hash"] = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")
        validated_data["created_at"] = now
        validated_data["updated_at"] = now
        validated_data["full_name"] = f'{validated_data.get("first_name", "").strip()} {validated_data.get("last_name", "").strip()}'.strip()
        validated_data["reg_code"] = reg_code

        return UserManagement.objects.create(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.full_name = f'{instance.first_name.strip()} {(instance.last_name or "").strip()}'.strip()

        if password:
            import bcrypt
            instance.password_hash = bcrypt.hashpw(
                password.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")

        from django.utils import timezone
        instance.updated_at = timezone.now()
        instance.save()
        return instance