from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_home(request):
    return JsonResponse(
        {
            "name": "SoilGenie API",
            "version": "1.0",
            "status": "online",
            "message": (
                "Welcome to the SoilGenie agricultural "
                "intelligence platform API."
            ),
        }
    )


urlpatterns = [
    # ============================================================
    # API HOME
    # ============================================================

    path(
        "",
        api_home,
        name="api-home",
    ),

    # ============================================================
    # DJANGO ADMIN
    # ============================================================

    path(
        "admin/",
        admin.site.urls,
    ),

    # ============================================================
    # AUTHENTICATION
    # ============================================================

    path(
        "api/auth/",
        include("apps.accounts.urls"),
    ),

    # ============================================================
    # FARMERS
    # ============================================================

    path(
        "api/farmers/",
        include("apps.farmers.urls"),
    ),

    # ============================================================
    # FARMS
    # ============================================================

    path(
        "api/farms/",
        include("apps.farms.urls"),
    ),

    # ============================================================
    # SOIL MANAGEMENT
    # ============================================================

    path(
        "api/soil/",
        include("apps.soil.urls"),
    ),

    # ============================================================
    # NOTIFICATIONS
    # ============================================================

    path(
        "api/notifications/",
        include("apps.notifications.urls"),
    ),
    
    path(
    "api/reports/",
    include("apps.reports.urls"),
),
    
    path(
    "api/weather/",
    include("apps.weather.urls"),
),
    
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )