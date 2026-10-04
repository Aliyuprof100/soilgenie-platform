from django.conf import settings
from django.db import models
from django.utils import timezone

import uuid


# ============================================================================
# SAMPLING ZONE
# ============================================================================

class SamplingZone(models.Model):
    """
    Represents a distinct area within a farm where soil samples
    can be collected.
    """

    farm = models.ForeignKey(
        "farms.Farm",
        on_delete=models.CASCADE,
        related_name="sampling_zones",
    )

    name = models.CharField(
        max_length=100,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    crop = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    area_hectares = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True,
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("ACTIVE", "Active"),
            ("INACTIVE", "Inactive"),
        ],
        default="ACTIVE",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.farm.farm_id} - {self.name}"


# ============================================================================
# SOIL SAMPLE
# ============================================================================

class SoilSample(models.Model):
    """
    Represents a physical soil sample collected from a farm.
    """

    COLLECTION_METHOD_CHOICES = [
        ("MANUAL", "Manual Collection"),
        ("SENSOR", "Sensor Collection"),
        ("LAB", "Laboratory Collection"),
    ]

    STATUS_CHOICES = [
        ("COLLECTED", "Collected"),
        ("RECEIVED", "Received"),
        ("TESTING", "Testing"),
        ("TESTED", "Tested"),
        ("REJECTED", "Rejected"),
    ]

    sample_id = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
    )

    farm = models.ForeignKey(
        "farms.Farm",
        on_delete=models.CASCADE,
        related_name="soil_samples",
    )

    sampling_zone = models.ForeignKey(
        SamplingZone,
        on_delete=models.SET_NULL,
        related_name="soil_samples",
        blank=True,
        null=True,
    )

    collected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="collected_soil_samples",
        blank=True,
        null=True,
    )

    collection_method = models.CharField(
        max_length=20,
        choices=COLLECTION_METHOD_CHOICES,
        default="MANUAL",
    )

    collection_date = models.DateTimeField(
        default=timezone.now,
    )

    sampling_depth_cm = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
    )

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True,
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True,
    )

    gps_accuracy = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
    )

    notes = models.TextField(
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="COLLECTED",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def save(self, *args, **kwargs):
        """
        Automatically generate a unique SoilGenie sample ID.
        """

        if not self.sample_id:
            self.sample_id = (
                f"SG-SAMPLE-{timezone.now().year}-"
                f"{uuid.uuid4().hex[:8].upper()}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return self.sample_id


# ============================================================================
# SOIL TEST
# ============================================================================

class SoilTest(models.Model):
    """
    Represents an analysis performed on a registered SoilSample.
    """

    TEST_METHOD_CHOICES = [
        ("SOILGENIE_SENSOR", "SoilGenie Sensor"),
        ("LABORATORY", "Laboratory"),
        ("MANUAL", "Manual Entry"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]

    test_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
    )

    sample = models.ForeignKey(
        SoilSample,
        on_delete=models.CASCADE,
        related_name="soil_tests",
    )

    test_method = models.CharField(
        max_length=30,
        choices=TEST_METHOD_CHOICES,
        default="MANUAL",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    tested_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    notes = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.sample.sample_id} - "
            f"{self.test_id}"
        )


# ============================================================================
# SOIL TEST RESULT
# ============================================================================

class SoilTestResult(models.Model):
    """
    Stores the measured soil parameters obtained from a SoilTest.

    These measurements form the raw input for the SoilGenie
    Soil Intelligence / Analysis Engine.
    """

    test = models.OneToOneField(
        SoilTest,
        on_delete=models.CASCADE,
        related_name="result",
    )

    # ------------------------------------------------------------------------
    # Soil chemistry
    # ------------------------------------------------------------------------

    ph = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
    )

    nitrogen_mg_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    phosphorus_mg_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    potassium_mg_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Soil physical properties
    # ------------------------------------------------------------------------

    moisture_percent = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
    )

    electrical_conductivity_ds_m = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        blank=True,
        null=True,
    )

    organic_matter_percent = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
    )

    temperature_celsius = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Timestamps
    # ------------------------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"Results - "
            f"{self.test.sample.sample_id}"
        )


# ============================================================================
# SOIL ANALYSIS
# ============================================================================

class SoilAnalysis(models.Model):
    """
    Stores the interpretation, diagnosis, and recommendations
    generated from a completed SoilTest.

    The analysis is generated by the SoilGenie Rule Engine
    and can later be extended with AI/ML-based intelligence.
    """

    SEVERITY_CHOICES = [
        ("GOOD", "Good"),
        ("MODERATE", "Moderate"),
        ("POOR", "Poor"),
        ("CRITICAL", "Critical"),
    ]

    # ------------------------------------------------------------------------
    # Relationship
    # ------------------------------------------------------------------------

    test = models.OneToOneField(
        SoilTest,
        on_delete=models.CASCADE,
        related_name="analysis",
    )

    # ------------------------------------------------------------------------
    # Overall soil health
    # ------------------------------------------------------------------------

    overall_status = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default="MODERATE",
    )

    summary = models.TextField(
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Individual soil parameter assessments
    # ------------------------------------------------------------------------

    ph_status = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    nitrogen_status = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    phosphorus_status = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    potassium_status = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    moisture_status = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    organic_matter_status = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # General recommendations
    # ------------------------------------------------------------------------

    recommendations = models.TextField(
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Specific recommendations
    # ------------------------------------------------------------------------

    fertilizer_recommendation = models.TextField(
        blank=True,
        null=True,
    )

    amendment_recommendation = models.TextField(
        blank=True,
        null=True,
    )

    irrigation_recommendation = models.TextField(
        blank=True,
        null=True,
    )

    crop_recommendation = models.TextField(
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Analysis metadata
    # ------------------------------------------------------------------------

    generated_by = models.CharField(
        max_length=50,
        default="SOILGENIE_RULE_ENGINE",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"Analysis - "
            f"{self.test.sample.sample_id}"
        )


# ============================================================================
# CROP INTELLIGENCE
# ============================================================================

class Crop(models.Model):
    """
    Represents a crop and its general soil requirements.

    These values are intended for SoilGenie's initial crop-suitability
    screening engine. They should later be calibrated against
    crop-specific agronomic research and regional conditions.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    scientific_name = models.CharField(
        max_length=150,
        blank=True,
        null=True,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Soil pH requirements
    # ------------------------------------------------------------------------

    min_ph = models.DecimalField(
        max_digits=4,
        decimal_places=2,
    )

    max_ph = models.DecimalField(
        max_digits=4,
        decimal_places=2,
    )

    # ------------------------------------------------------------------------
    # Nitrogen requirements
    # ------------------------------------------------------------------------

    min_nitrogen_mg_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    max_nitrogen_mg_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Phosphorus requirements
    # ------------------------------------------------------------------------

    min_phosphorus_mg_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    max_phosphorus_mg_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Potassium requirements
    # ------------------------------------------------------------------------

    min_potassium_mg_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    max_potassium_mg_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Soil moisture requirements
    # ------------------------------------------------------------------------

    min_moisture_percent = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
    )

    max_moisture_percent = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Organic matter requirement
    # ------------------------------------------------------------------------

    min_organic_matter_percent = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Salinity tolerance
    # ------------------------------------------------------------------------

    max_ec_ds_m = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        blank=True,
        null=True,
    )

    # ------------------------------------------------------------------------
    # Crop information
    # ------------------------------------------------------------------------

    water_requirement = models.CharField(
        max_length=30,
        blank=True,
        null=True,
    )

    growing_season = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    active = models.BooleanField(
        default=True,
    )

    # ------------------------------------------------------------------------
    # Metadata
    # ------------------------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name