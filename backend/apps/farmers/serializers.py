from rest_framework import serializers

from .models import Farmer


class FarmerSerializer(serializers.ModelSerializer):
    registered_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Farmer

        fields = (
            "id",
            "farmer_id",
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
            "registered_by",
            "registered_by_name",
            "created_at",
            "updated_at",
        )

    def get_registered_by_name(self, obj):
        return (
            f"{obj.registered_by.first_name} "
            f"{obj.registered_by.last_name}"
        ).strip()