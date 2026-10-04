from rest_framework import serializers

from .models import Farmer


class FarmerSerializer(serializers.ModelSerializer):
    registered_by_name = serializers.SerializerMethodField()

    # Information about the farmer's own SoilGenie account.
    # These are read-only and cannot be used by the frontend
    # to arbitrarily change account ownership.
    user_id = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    has_user_account = serializers.SerializerMethodField()

    class Meta:
        model = Farmer

        fields = (
            "id",
            "farmer_id",

            # Farmer's own SoilGenie account
            "user_id",
            "user_email",
            "has_user_account",

            # Agent/admin who registered the farmer
            "registered_by",
            "registered_by_name",

            "first_name",
            "last_name",
            "phone_number",
            "alternative_phone",
            "email",

            "gender",
            "date_of_birth",

            "state",
            "lga",
            "ward",
            "village",
            "address",

            "primary_crop",
            "farm_size",
            "number_of_farms",
            "farming_type",

            "status",

            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "farmer_id",

            "user_id",
            "user_email",
            "has_user_account",

            "registered_by",
            "registered_by_name",

            "created_at",
            "updated_at",
        )

    def get_registered_by_name(self, obj):
        if not obj.registered_by:
            return ""

        full_name = (
            f"{obj.registered_by.first_name} "
            f"{obj.registered_by.last_name}"
        ).strip()

        if full_name:
            return full_name

        return getattr(
            obj.registered_by,
            "email",
            "",
        )

    def get_user_id(self, obj):
        if not obj.user:
            return None

        return str(obj.user.id)

    def get_user_email(self, obj):
        if not obj.user:
            return None

        return obj.user.email

    def get_has_user_account(self, obj):
        return obj.user is not None