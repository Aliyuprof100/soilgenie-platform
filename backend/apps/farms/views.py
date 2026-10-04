from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Farm
from .serializers import FarmSerializer


class FarmListCreateView(generics.ListCreateAPIView):
    serializer_class = FarmSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = Farm.objects.select_related(
            "farmer",
            "farmer__user",
            "registered_by",
        )

        # --------------------------------------------------------
        # ADMIN
        # Can see every farm in SoilGenie.
        # --------------------------------------------------------
        if user.role == "ADMIN":
            return queryset.all().order_by(
                "-created_at"
            )

        # --------------------------------------------------------
        # FARMER
        # Can only see farms belonging to their own linked
        # Farmer profile.
        # --------------------------------------------------------
        if user.role == "FARMER":
            return queryset.filter(
                farmer__user=user
            ).order_by(
                "-created_at"
            )

        # --------------------------------------------------------
        # AGENT
        # Can see farms registered by that agent.
        # --------------------------------------------------------
        return queryset.filter(
            registered_by=user
        ).order_by(
            "-created_at"
        )

    def perform_create(
        self,
        serializer
    ):
        user = self.request.user

        # Farmers should not create arbitrary farm records through
        # the agent farm-registration endpoint.
        if user.role == "FARMER":
            raise PermissionDenied(
                "Farmer accounts cannot register farms through "
                "this endpoint."
            )

        serializer.save(
            registered_by=user
        )


class FarmDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = FarmSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = Farm.objects.select_related(
            "farmer",
            "farmer__user",
            "registered_by",
        )

        # --------------------------------------------------------
        # ADMIN
        # --------------------------------------------------------
        if user.role == "ADMIN":
            return queryset.all()

        # --------------------------------------------------------
        # FARMER
        # A farmer can only retrieve a farm belonging to their
        # own linked Farmer profile.
        # --------------------------------------------------------
        if user.role == "FARMER":
            return queryset.filter(
                farmer__user=user
            )

        # --------------------------------------------------------
        # AGENT
        # --------------------------------------------------------
        return queryset.filter(
            registered_by=user
        )

    def perform_update(
        self,
        serializer
    ):
        user = self.request.user

        if user.role == "FARMER":
            raise PermissionDenied(
                "Farmer accounts cannot modify farm records "
                "through this endpoint."
            )

        serializer.save()

    def perform_destroy(
        self,
        instance
    ):
        user = self.request.user

        if user.role == "FARMER":
            raise PermissionDenied(
                "Farmer accounts cannot delete farm records "
                "through this endpoint."
            )

        instance.delete()