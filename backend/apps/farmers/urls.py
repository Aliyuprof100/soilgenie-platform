from django.urls import path

from .views import (
    FarmerListCreateView,
    FarmerDetailView,
    FarmerStatisticsView,
)

urlpatterns = [
    path(
        "",
        FarmerListCreateView.as_view(),
        name="farmer-list-create",
    ),

    path(
        "statistics/",
        FarmerStatisticsView.as_view(),
        name="farmer-statistics",
    ),

    path(
        "<int:pk>/",
        FarmerDetailView.as_view(),
        name="farmer-detail",
    ),
]