from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(ModelViewSet):

    serializer_class = NotificationSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    http_method_names = [
        "get",
        "patch",
        "delete",
        "head",
        "options",
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Notification.objects
            .filter(recipient=user)
            .select_related(
                "recipient",
                "farmer",
                "farm",
                "soil_sample",
                "soil_test",
            )
        )

        is_read = self.request.query_params.get(
            "is_read"
        )

        notification_type = (
            self.request.query_params.get(
                "type"
            )
        )

        priority = self.request.query_params.get(
            "priority"
        )

        if is_read is not None:
            normalized = (
                is_read.strip().lower()
            )

            if normalized in {
                "true",
                "1",
                "yes",
            }:
                queryset = queryset.filter(
                    is_read=True
                )

            elif normalized in {
                "false",
                "0",
                "no",
            }:
                queryset = queryset.filter(
                    is_read=False
                )

        if notification_type:
            queryset = queryset.filter(
                notification_type=notification_type
            )

        if priority:
            queryset = queryset.filter(
                priority=priority
            )

        return queryset

    def partial_update(
        self,
        request,
        *args,
        **kwargs,
    ):
        notification = self.get_object()

        allowed_fields = {
            "is_read",
        }

        submitted_fields = set(
            request.data.keys()
        )

        unsupported_fields = (
            submitted_fields
            - allowed_fields
        )

        if unsupported_fields:
            return Response(
                {
                    "detail": (
                        "Only the is_read field "
                        "can be updated through "
                        "this endpoint."
                    )
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        if "is_read" not in request.data:
            return Response(
                {
                    "detail": (
                        "Provide the is_read "
                        "field."
                    )
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        is_read = request.data.get(
            "is_read"
        )

        if not isinstance(
            is_read,
            bool,
        ):
            return Response(
                {
                    "detail": (
                        "is_read must be true "
                        "or false."
                    )
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        if is_read:
            notification.is_read = True

            if notification.read_at is None:
                notification.read_at = (
                    timezone.now()
                )

        else:
            notification.is_read = False
            notification.read_at = None

        notification.save(
            update_fields=[
                "is_read",
                "read_at",
                "updated_at",
            ]
        )

        serializer = self.get_serializer(
            notification
        )

        return Response(
            serializer.data
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="unread-count",
    )
    def unread_count(
        self,
        request,
    ):
        count = (
            self.get_queryset()
            .filter(
                is_read=False
            )
            .count()
        )

        return Response(
            {
                "unread_count": count,
            }
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="mark-read",
    )
    def mark_read(
        self,
        request,
        pk=None,
    ):
        notification = (
            self.get_object()
        )

        notification.mark_as_read()

        serializer = self.get_serializer(
            notification
        )

        return Response(
            serializer.data
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="mark-unread",
    )
    def mark_unread(
        self,
        request,
        pk=None,
    ):
        notification = (
            self.get_object()
        )

        notification.mark_as_unread()

        serializer = self.get_serializer(
            notification
        )

        return Response(
            serializer.data
        )

    @action(
        detail=False,
        methods=["patch"],
        url_path="mark-all-read",
    )
    def mark_all_read(
        self,
        request,
    ):
        now = timezone.now()

        updated = (
            self.get_queryset()
            .filter(
                is_read=False
            )
            .update(
                is_read=True,
                read_at=now,
                updated_at=now,
            )
        )

        return Response(
            {
                "updated": updated,
                "message": (
                    "All notifications "
                    "have been marked as read."
                ),
            }
        )