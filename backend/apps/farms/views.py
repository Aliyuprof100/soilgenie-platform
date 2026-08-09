from rest_framework import generics, permissions

from .models import Farm
from .serializers import FarmSerializer


class FarmListCreateView(generics.ListCreateAPIView):

    serializer_class = FarmSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role == "ADMIN":
            return Farm.objects.select_related(
                "farmer",
                "registered_by",
            ).all().order_by("-created_at")

        return Farm.objects.select_related(
            "farmer",
            "registered_by",
        ).filter(
            registered_by=user
        ).order_by("-created_at")

    def perform_create(self, serializer):

        serializer.save(
            registered_by=self.request.user
        )


class FarmDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = FarmSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role == "ADMIN":
            return Farm.objects.select_related(
                "farmer",
                "registered_by",
            ).all()

        return Farm.objects.select_related(
            "farmer",
            "registered_by",
        ).filter(
            registered_by=user
        )