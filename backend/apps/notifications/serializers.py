from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    recipient_name = serializers.SerializerMethodField()

    farmer_name = serializers.SerializerMethodField()

    farm_name = serializers.SerializerMethodField()

    sample_id = serializers.SerializerMethodField()

    test_id = serializers.SerializerMethodField()

    class Meta:
        model = Notification

        fields = [
            "id",

            "recipient",
            "recipient_name",

            "notification_type",
            "priority",

            "title",
            "message",

            "is_read",
            "read_at",

            "action_url",

            "farmer",
            "farmer_name",

            "farm",
            "farm_name",

            "soil_sample",
            "sample_id",

            "soil_test",
            "test_id",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",

            "recipient",
            "recipient_name",

            "is_read",
            "read_at",

            "farmer_name",
            "farm_name",
            "sample_id",
            "test_id",

            "created_at",
            "updated_at",
        ]

    def get_recipient_name(
        self,
        obj,
    ):
        recipient = obj.recipient

        full_name = (
            f"{recipient.first_name} "
            f"{recipient.last_name}"
        ).strip()

        return (
            full_name
            or recipient.email
        )

    def get_farmer_name(
        self,
        obj,
    ):
        if not obj.farmer:
            return None

        return (
            f"{obj.farmer.first_name} "
            f"{obj.farmer.last_name}"
        ).strip()

    def get_farm_name(
        self,
        obj,
    ):
        if not obj.farm:
            return None

        return obj.farm.farm_name

    def get_sample_id(
        self,
        obj,
    ):
        if not obj.soil_sample:
            return None

        return obj.soil_sample.sample_id

    def get_test_id(
        self,
        obj,
    ):
        if not obj.soil_test:
            return None

        return str(
            obj.soil_test.test_id
        )