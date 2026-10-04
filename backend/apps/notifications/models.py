from django.conf import settings
from django.db import models
from django.utils import timezone


class Notification(models.Model):

    class NotificationType(models.TextChoices):
        SOIL_SAMPLE = "SOIL_SAMPLE", "Soil Sample"
        SOIL_TEST = "SOIL_TEST", "Soil Test"
        SOIL_REPORT = "SOIL_REPORT", "Soil Report"
        MEASUREMENT_WARNING = (
            "MEASUREMENT_WARNING",
            "Measurement Warning",
        )
        SYSTEM = "SYSTEM", "System"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        NORMAL = "NORMAL", "Normal"
        HIGH = "HIGH", "High"
        CRITICAL = "CRITICAL", "Critical"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
    )

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.NORMAL,
    )

    title = models.CharField(
        max_length=255,
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False,
    )

    read_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    action_url = models.CharField(
        max_length=500,
        blank=True,
        null=True,
    )

    farmer = models.ForeignKey(
        "farmers.Farmer",
        on_delete=models.SET_NULL,
        related_name="notifications",
        blank=True,
        null=True,
    )

    farm = models.ForeignKey(
        "farms.Farm",
        on_delete=models.SET_NULL,
        related_name="notifications",
        blank=True,
        null=True,
    )

    soil_sample = models.ForeignKey(
        "soil.SoilSample",
        on_delete=models.SET_NULL,
        related_name="notifications",
        blank=True,
        null=True,
    )

    soil_test = models.ForeignKey(
        "soil.SoilTest",
        on_delete=models.SET_NULL,
        related_name="notifications",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["recipient", "is_read"],
            ),
            models.Index(
                fields=["recipient", "created_at"],
            ),
            models.Index(
                fields=["notification_type"],
            ),
            models.Index(
                fields=["priority"],
            ),
        ]

    def __str__(self):
        return (
            f"{self.recipient} - "
            f"{self.title}"
        )

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()

            self.save(
                update_fields=[
                    "is_read",
                    "read_at",
                    "updated_at",
                ]
            )

    def mark_as_unread(self):
        if self.is_read or self.read_at is not None:
            self.is_read = False
            self.read_at = None

            self.save(
                update_fields=[
                    "is_read",
                    "read_at",
                    "updated_at",
                ]
            )