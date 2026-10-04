from rest_framework import serializers

from .models import (
    SamplingZone,
    SoilSample,
    SoilTest,
    SoilTestResult,
    SoilAnalysis,
)


# ============================================================================
# SAMPLING ZONE
# ============================================================================

class SamplingZoneSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(
        source="farm.farm_name",
        read_only=True,
    )

    farm_id = serializers.CharField(
        source="farm.farm_id",
        read_only=True,
    )

    class Meta:
        model = SamplingZone

        fields = [
            "id",
            "farm",
            "farm_id",
            "farm_name",
            "name",
            "description",
            "crop",
            "area_hectares",
            "latitude",
            "longitude",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "farm_id",
            "farm_name",
            "created_at",
            "updated_at",
        ]


# ============================================================================
# SOIL SAMPLE
# ============================================================================

class SoilSampleSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(
        source="farm.farm_name",
        read_only=True,
    )

    farm_id = serializers.CharField(
        source="farm.farm_id",
        read_only=True,
    )

    sampling_zone_name = serializers.CharField(
        source="sampling_zone.name",
        read_only=True,
    )

    collected_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SoilSample

        fields = [
            "id",
            "sample_id",
            "farm",
            "farm_id",
            "farm_name",
            "sampling_zone",
            "sampling_zone_name",
            "collected_by",
            "collected_by_name",
            "collection_method",
            "collection_date",
            "sampling_depth_cm",
            "latitude",
            "longitude",
            "gps_accuracy",
            "notes",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "sample_id",
            "farm_id",
            "farm_name",
            "sampling_zone_name",
            "collected_by",
            "collected_by_name",
            "created_at",
            "updated_at",
        ]

    def get_collected_by_name(self, obj):
        """
        Return a readable name for the user
        who collected the soil sample.
        """

        if not obj.collected_by:
            return None

        user = obj.collected_by

        first_name = getattr(
            user,
            "first_name",
            "",
        ) or ""

        last_name = getattr(
            user,
            "last_name",
            "",
        ) or ""

        full_name = (
            f"{first_name} {last_name}"
        ).strip()

        if full_name:
            return full_name

        username = getattr(
            user,
            "username",
            "",
        ) or ""

        if username:
            return username

        email = getattr(
            user,
            "email",
            "",
        ) or ""

        if email:
            return email

        return str(user)


# ============================================================================
# SOIL TEST RESULT
# ============================================================================

class SoilTestResultSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = SoilTestResult

        fields = [
            "id",
            "test",
            "ph",
            "nitrogen_mg_kg",
            "phosphorus_mg_kg",
            "potassium_mg_kg",
            "moisture_percent",
            "electrical_conductivity_ds_m",
            "organic_matter_percent",
            "temperature_celsius",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


# ============================================================================
# SOIL TEST
# ============================================================================

class SoilTestSerializer(
    serializers.ModelSerializer
):

    sample_id = serializers.CharField(
        source="sample.sample_id",
        read_only=True,
    )

    farm_name = serializers.CharField(
        source="sample.farm.farm_name",
        read_only=True,
    )

    result = SoilTestResultSerializer(
        read_only=True
    )

    class Meta:
        model = SoilTest

        fields = [
            "id",
            "test_id",
            "sample",
            "sample_id",
            "farm_name",
            "test_method",
            "status",
            "tested_at",
            "notes",
            "result",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "test_id",
            "sample_id",
            "farm_name",
            "result",
            "created_at",
            "updated_at",
        ]


# ============================================================================
# SOIL ANALYSIS
# ============================================================================

class SoilAnalysisSerializer(
    serializers.ModelSerializer
):

    sample_id = serializers.CharField(
        source="test.sample.sample_id",
        read_only=True,
    )

    test_id = serializers.UUIDField(
        source="test.test_id",
        read_only=True,
    )

    class Meta:
        model = SoilAnalysis

        fields = [
            "id",

            # Relationship
            "test",
            "test_id",
            "sample_id",

            # Overall assessment
            "overall_status",
            "summary",

            # Individual soil parameter assessments
            "ph_status",
            "nitrogen_status",
            "phosphorus_status",
            "potassium_status",
            "moisture_status",
            "organic_matter_status",

            # Recommendations
            "recommendations",
            "fertilizer_recommendation",
            "amendment_recommendation",
            "irrigation_recommendation",
            "crop_recommendation",

            # Metadata
            "generated_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "test_id",
            "sample_id",
            "generated_by",
            "created_at",
            "updated_at",
        ]