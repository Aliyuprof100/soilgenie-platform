from django.urls import path

from .views import (
    FarmerListCreateView,
    FarmerDetailView,
    FarmerStatisticsView,
    CurrentFarmerView,
)


urlpatterns = [
    # ============================================================
    # FARMER LIST / CREATE
    # ============================================================

    path(
        "",
        FarmerListCreateView.as_view(),
        name="farmer-list-create",
    ),

    # ============================================================
    # CURRENT LOGGED-IN FARMER
    # ============================================================

    path(
        "me/",
        CurrentFarmerView.as_view(),
        name="current-farmer",
    ),

    # ============================================================
    # FARMER STATISTICS
    # ============================================================

    path(
        "statistics/",
        FarmerStatisticsView.as_view(),
        name="farmer-statistics",
    ),

    # ============================================================
    # FARMER DETAIL
    # ============================================================

    path(
        "<int:pk>/",
        FarmerDetailView.as_view(),
        name="farmer-detail",
    ),
]