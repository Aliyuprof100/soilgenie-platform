from rest_framework import serializers

from .models import Farm


class FarmSerializer(serializers.ModelSerializer):
    farmer_name = serializers.SerializerMethodField()
    registered_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Farm

        fields = (
            "id",
            "farm_id",

            "farmer",
            "farmer_name",

            "registered_by",
            "registered_by_name",

            "farm_name",
            "farm_size",
            "primary_crop",

            "farming_type",
            "irrigation_type",
            "ownership_type",

            "state",
            "lga",
            "ward",
            "village",
            "address",

            # GPS Location
            "latitude",
            "longitude",
            "gps_accuracy",

            "status",

            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "farm_id",
            "registered_by",
            "registered_by_name",
            "farmer_name",
            "created_at",
            "updated_at",
        )

    def get_farmer_name(self, obj):
        return (
            f"{obj.farmer.first_name} "
            f"{obj.farmer.last_name}"
        ).strip()

    def get_registered_by_name(self, obj):
        return (
            f"{obj.registered_by.first_name} "
            f"{obj.registered_by.last_name}"
        ).strip()