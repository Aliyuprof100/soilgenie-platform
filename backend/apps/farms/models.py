from django.conf import settings
from django.db import models


class Farm(models.Model):

    FARMING_TYPE_CHOICES = (
        ("SMALLHOLDER", "Smallholder"),
        ("COMMERCIAL", "Commercial"),
        ("COOPERATIVE", "Cooperative"),
    )

    IRRIGATION_CHOICES = (
        ("RAIN_FED", "Rain-fed"),
        ("IRRIGATED", "Irrigated"),
        ("MIXED", "Mixed"),
    )

    OWNERSHIP_CHOICES = (
        ("OWNED", "Owned"),
        ("LEASED", "Leased"),
        ("COMMUNAL", "Communal"),
        ("FAMILY", "Family"),
        ("OTHER", "Other"),
    )

    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
    )

    farm_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    farmer = models.ForeignKey(
        "farmers.Farmer",
        on_delete=models.CASCADE,
        related_name="farms",
    )

    registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="registered_farms",
    )

    farm_name = models.CharField(
        max_length=150,
    )

    farm_size = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Farm size in hectares.",
    )

    primary_crop = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    farming_type = models.CharField(
        max_length=20,
        choices=FARMING_TYPE_CHOICES,
        default="SMALLHOLDER",
    )

    irrigation_type = models.CharField(
        max_length=20,
        choices=IRRIGATION_CHOICES,
        default="RAIN_FED",
    )

    ownership_type = models.CharField(
        max_length=20,
        choices=OWNERSHIP_CHOICES,
        default="OWNED",
    )

    state = models.CharField(
        max_length=100,
    )

    lga = models.CharField(
        max_length=100,
    )

    ward = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    village = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    address = models.TextField(
        blank=True,
        null=True,
    )

    # GPS Location
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True,
        help_text="GPS latitude.",
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True,
        help_text="GPS longitude.",
    )

    gps_accuracy = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="GPS accuracy in metres.",
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="ACTIVE",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def save(self, *args, **kwargs):

        if not self.farm_id:

            last_farm = (
                Farm.objects
                .order_by("-id")
                .first()
            )

            if last_farm:
                next_number = last_farm.id + 1
            else:
                next_number = 1

            self.farm_id = (
                f"SG-FARM-{next_number:06d}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.farm_name} "
            f"({self.farm_id})"
        )