from django.conf import settings
from django.db import models


class Farmer(models.Model):

    GENDER_CHOICES = (
        ("MALE", "Male"),
        ("FEMALE", "Female"),
        ("OTHER", "Other"),
    )

    FARMING_TYPE_CHOICES = (
        ("SMALLHOLDER", "Smallholder"),
        ("COMMERCIAL", "Commercial"),
        ("COOPERATIVE", "Cooperative"),
    )

    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
    )

    farmer_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="registered_farmers",
    )

    first_name = models.CharField(
        max_length=100
    )

    last_name = models.CharField(
        max_length=100
    )

    phone_number = models.CharField(
        max_length=20
    )

    alternative_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    email = models.EmailField(
        blank=True,
        null=True,
    )

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
    )

    date_of_birth = models.DateField(
        blank=True,
        null=True,
    )

    state = models.CharField(
        max_length=100
    )

    lga = models.CharField(
        max_length=100
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

    primary_crop = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    farm_size = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Farm size in hectares.",
    )

    number_of_farms = models.PositiveIntegerField(
        default=1
    )

    farming_type = models.CharField(
        max_length=20,
        choices=FARMING_TYPE_CHOICES,
        default="SMALLHOLDER",
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="ACTIVE",
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):

        if not self.farmer_id:

            last_farmer = (
                Farmer.objects
                .order_by("-id")
                .first()
            )

            if last_farmer:
                next_number = last_farmer.id + 1
            else:
                next_number = 1

            self.farmer_id = (
                f"SG-F-{next_number:06d}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.first_name} "
            f"{self.last_name} "
            f"({self.farmer_id})"
        )