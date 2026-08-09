from django.urls import path

from .views import (
    FarmListCreateView,
    FarmDetailView,
)


urlpatterns = [

    path(
        "",
        FarmListCreateView.as_view(),
        name="farm-list-create",
    ),

    path(
        "<int:pk>/",
        FarmDetailView.as_view(),
        name="farm-detail",
    ),

]