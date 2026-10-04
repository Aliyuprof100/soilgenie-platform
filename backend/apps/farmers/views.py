from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Farmer
from .serializers import FarmerSerializer


# ================================================================
# FARMER LIST / CREATE
# ================================================================

class FarmerListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = FarmerSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        user = self.request.user

        # Admin can see all farmers
        if user.role == "ADMIN":
            return (
                Farmer.objects
                .all()
                .order_by("-created_at")
            )

        # Farmer should only ever see
        # their own Farmer profile.
        if user.role == "FARMER":
            return (
                Farmer.objects
                .filter(user=user)
                .order_by("-created_at")
            )

        # Agent sees farmers registered
        # by that agent.
        return (
            Farmer.objects
            .filter(
                registered_by=user
            )
            .order_by("-created_at")
        )

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            registered_by=
            self.request.user
        )


# ================================================================
# FARMER DETAIL
# ================================================================

class FarmerDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = FarmerSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Farmer.objects.all()

        if user.role == "FARMER":
            return Farmer.objects.filter(
                user=user
            )

        return Farmer.objects.filter(
            registered_by=user
        )


# ================================================================
# CURRENT LOGGED-IN FARMER
# ================================================================

class CurrentFarmerView(APIView):
    """
    Return the Farmer profile belonging
    to the currently authenticated
    FARMER account.

    This endpoint is intended for the
    farmer portal/dashboard.
    """

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(
        self,
        request
    ):
        user = request.user

        if user.role != "FARMER":
            return Response(
                {
                    "detail":
                    "This endpoint is available only to farmer accounts."
                },
                status=
                status.HTTP_403_FORBIDDEN,
            )

        try:
            farmer = Farmer.objects.get(
                user=user
            )
        except Farmer.DoesNotExist:
            return Response(
                {
                    "detail":
                    "No Farmer profile is linked to this account."
                },
                status=
                status.HTTP_404_NOT_FOUND,
            )

        serializer = FarmerSerializer(
            farmer
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ================================================================
# FARMER STATISTICS
# ================================================================

class FarmerStatisticsView(
    APIView
):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(
        self,
        request
    ):
        user = request.user

        if user.role == "ADMIN":
            return Response(
                {
                    "my_farmers_count":
                    Farmer.objects.count(),

                    "total_farmers_count":
                    Farmer.objects.count(),
                }
            )

        if user.role == "FARMER":
            farmer_exists = (
                Farmer.objects
                .filter(user=user)
                .exists()
            )

            return Response(
                {
                    "my_farmers_count":
                    1
                    if farmer_exists
                    else 0,

                    "total_farmers_count":
                    1
                    if farmer_exists
                    else 0,
                }
            )

        my_farmers_count = (
            Farmer.objects
            .filter(
                registered_by=user
            )
            .count()
        )

        total_farmers_count = (
            Farmer.objects.count()
        )

        return Response(
            {
                "my_farmers_count":
                my_farmers_count,

                "total_farmers_count":
                total_farmers_count,
            }
        )