from django.contrib import admin

from .models import Farm


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):

    list_display = (
        "farm_id",
        "farm_name",
        "farmer",
        "farm_size",
        "primary_crop",
        "state",
        "lga",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "farming_type",
        "irrigation_type",
        "ownership_type",
        "state",
        "lga",
    )

    search_fields = (
        "farm_id",
        "farm_name",
        "farmer__first_name",
        "farmer__last_name",
        "farmer__farmer_id",
        "primary_crop",
    )

    readonly_fields = (
        "farm_id",
        "created_at",
        "updated_at",
    )