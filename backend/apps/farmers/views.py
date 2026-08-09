from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Farmer
from .serializers import FarmerSerializer


class FarmerListCreateView(generics.ListCreateAPIView):
    serializer_class = FarmerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Farmer.objects.all().order_by("-created_at")

        return Farmer.objects.filter(
            registered_by=user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            registered_by=self.request.user
        )


class FarmerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FarmerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Farmer.objects.all()

        return Farmer.objects.filter(
            registered_by=user
        )


class FarmerStatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        my_farmers_count = Farmer.objects.filter(
            registered_by=user
        ).count()

        total_farmers_count = Farmer.objects.count()

        return Response({
            "my_farmers_count": my_farmers_count,
            "total_farmers_count": total_farmers_count,
        })