from django.urls import path

from .views import SoilReportPDFView


urlpatterns = [
    path(
        "soil/<int:test_id>/pdf/",
        SoilReportPDFView.as_view(),
        name="soil-report-pdf",
    ),
]