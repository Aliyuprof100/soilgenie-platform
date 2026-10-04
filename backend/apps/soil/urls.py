from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    SamplingZoneViewSet,
    SoilSampleViewSet,
    SoilTestViewSet,
    SoilTestResultViewSet,
    SoilAnalysisViewSet,
)


router = DefaultRouter()


router.register(
    r"zones",
    SamplingZoneViewSet,
    basename="sampling-zone",
)


router.register(
    r"samples",
    SoilSampleViewSet,
    basename="soil-sample",
)


router.register(
    r"tests",
    SoilTestViewSet,
    basename="soil-test",
)


router.register(
    r"results",
    SoilTestResultViewSet,
    basename="soil-test-result",
)


router.register(
    r"analysis",
    SoilAnalysisViewSet,
    basename="soil-analysis",
)


urlpatterns = [
    path(
        "",
        include(router.urls),
    ),
]