from django.urls import path

from .views import FarmWeatherView


urlpatterns = [
    path(
        "farm/<int:farm_id>/",
        FarmWeatherView.as_view(),
        name="farm-weather",
    ),
]