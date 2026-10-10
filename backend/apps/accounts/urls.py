from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    MeView,
)

from .admin_views import (
    AdminDashboardView,
    AdminAgentsView,
    AdminAgentDetailView,
)



urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="refresh",
    ),

    path(
        "me/",
        MeView.as_view(),
        name="me",
    ),

    # ========================================================
    # ADMIN
    # ========================================================

    path(
        "admin/dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
        ),

    path(
    "admin/agents/",
    AdminAgentsView.as_view(),
    name="admin-agents",
),

path(
    "admin/agents/<uuid:agent_id>/",
    AdminAgentDetailView.as_view(),
    name="admin-agent-detail",
),
]
