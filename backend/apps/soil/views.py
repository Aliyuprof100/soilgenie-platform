from django.db import transaction
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.services import (
    notify_measurement_verification_required,
    notify_soil_assessment_completed,
    notify_soil_sample_registered,
    notify_soil_test_created,
)

from .models import (
    SamplingZone,
    SoilSample,
    SoilTest,
    SoilTestResult,
    SoilAnalysis,
)

from .serializers import (
    SamplingZoneSerializer,
    SoilSampleSerializer,
    SoilTestSerializer,
    SoilTestResultSerializer,
    SoilAnalysisSerializer,
)

from .services.soil_analysis import generate_soil_analysis
from .services.recommendations import generate_recommendations


# ============================================================================
# SHARED ROLE HELPERS
# ============================================================================


def is_admin(user):
    return getattr(user, "role", None) == "ADMIN"


def is_farmer(user):
    return getattr(user, "role", None) == "FARMER"


def ensure_farmer_read_only(user):
    """
    Farmer accounts use the soil endpoints for viewing their own
    soil information and reports.

    Technical soil records are created/modified by authorised
    agents/admins rather than through the farmer portal.
    """

    if is_farmer(user):
        raise PermissionDenied(
            "Farmer accounts have read-only access to soil records."
        )


# ============================================================================
# SAMPLING ZONES
# ============================================================================


class SamplingZoneViewSet(viewsets.ModelViewSet):
    queryset = (
        SamplingZone.objects
        .select_related(
            "farm",
            "farm__farmer",
            "farm__farmer__user",
            "farm__registered_by",
        )
        .all()
    )

    serializer_class = SamplingZoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = super().get_queryset()

        # --------------------------------------------------------------------
        # ROLE-BASED DATA ACCESS
        # --------------------------------------------------------------------

        if is_admin(user):
            pass

        elif is_farmer(user):
            queryset = queryset.filter(
                farm__farmer__user=user
            )

        else:
            queryset = queryset.filter(
                farm__registered_by=user
            )

        # --------------------------------------------------------------------
        # EXISTING FILTERS
        # --------------------------------------------------------------------

        farm_id = self.request.query_params.get(
            "farm"
        )

        if farm_id:
            queryset = queryset.filter(
                farm_id=farm_id
            )

        return queryset

    def perform_create(self, serializer):
        ensure_farmer_read_only(
            self.request.user
        )

        serializer.save()

    def perform_update(self, serializer):
        ensure_farmer_read_only(
            self.request.user
        )

        serializer.save()

    def perform_destroy(self, instance):
        ensure_farmer_read_only(
            self.request.user
        )

        instance.delete()


# ============================================================================
# SOIL SAMPLES
# ============================================================================


class SoilSampleViewSet(viewsets.ModelViewSet):
    queryset = (
        SoilSample.objects
        .select_related(
            "farm",
            "farm__farmer",
            "farm__farmer__user",
            "farm__registered_by",
            "sampling_zone",
            "collected_by",
        )
        .all()
    )

    serializer_class = SoilSampleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = super().get_queryset()

        # --------------------------------------------------------------------
        # ROLE-BASED DATA ACCESS
        # --------------------------------------------------------------------

        if is_admin(user):
            pass

        elif is_farmer(user):
            queryset = queryset.filter(
                farm__farmer__user=user
            )

        else:
            queryset = queryset.filter(
                farm__registered_by=user
            )

        # --------------------------------------------------------------------
        # EXISTING FILTERS
        # --------------------------------------------------------------------

        farm_id = self.request.query_params.get(
            "farm"
        )

        status_filter = (
            self.request.query_params.get(
                "status"
            )
        )

        if farm_id:
            queryset = queryset.filter(
                farm_id=farm_id
            )

        if status_filter:
            queryset = queryset.filter(
                status=status_filter
            )

        return queryset

    def perform_create(self, serializer):
        user = self.request.user

        ensure_farmer_read_only(user)

        soil_sample = serializer.save(
            collected_by=user
        )

        # --------------------------------------------------------------------
        # NOTIFICATION
        # --------------------------------------------------------------------

        notify_soil_sample_registered(
            soil_sample
        )

    def perform_update(self, serializer):
        ensure_farmer_read_only(
            self.request.user
        )

        serializer.save()

    def perform_destroy(self, instance):
        ensure_farmer_read_only(
            self.request.user
        )

        instance.delete()


# ============================================================================
# SOIL TESTS
# ============================================================================


class SoilTestViewSet(viewsets.ModelViewSet):
    queryset = (
        SoilTest.objects
        .select_related(
            "sample",
            "sample__farm",
            "sample__farm__farmer",
            "sample__farm__farmer__user",
            "sample__farm__registered_by",
        )
        .prefetch_related(
            "result"
        )
        .all()
    )

    serializer_class = SoilTestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = super().get_queryset()

        # --------------------------------------------------------------------
        # ROLE-BASED DATA ACCESS
        # --------------------------------------------------------------------

        if is_admin(user):
            pass

        elif is_farmer(user):
            queryset = queryset.filter(
                sample__farm__farmer__user=user
            )

        else:
            queryset = queryset.filter(
                sample__farm__registered_by=user
            )

        # --------------------------------------------------------------------
        # EXISTING FILTERS
        # --------------------------------------------------------------------

        sample_id = (
            self.request.query_params.get(
                "sample"
            )
        )

        status_filter = (
            self.request.query_params.get(
                "status"
            )
        )

        if sample_id:
            queryset = queryset.filter(
                sample_id=sample_id
            )

        if status_filter:
            queryset = queryset.filter(
                status=status_filter
            )

        return queryset

    def perform_create(self, serializer):
        ensure_farmer_read_only(
            self.request.user
        )

        soil_test = serializer.save()

        # --------------------------------------------------------------------
        # NOTIFICATION
        # --------------------------------------------------------------------

        notify_soil_test_created(
            soil_test
        )

    def perform_update(self, serializer):
        ensure_farmer_read_only(
            self.request.user
        )

        serializer.save()

    def perform_destroy(self, instance):
        ensure_farmer_read_only(
            self.request.user
        )

        instance.delete()


# ============================================================================
# SOIL TEST RESULTS
# ============================================================================


class SoilTestResultViewSet(viewsets.ModelViewSet):
    queryset = (
        SoilTestResult.objects
        .select_related(
            "test",
            "test__sample",
            "test__sample__farm",
            "test__sample__farm__farmer",
            "test__sample__farm__farmer__user",
            "test__sample__farm__registered_by",
        )
        .all()
    )

    serializer_class = SoilTestResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = super().get_queryset()

        # --------------------------------------------------------------------
        # ROLE-BASED DATA ACCESS
        # --------------------------------------------------------------------

        if is_admin(user):
            return queryset

        if is_farmer(user):
            return queryset.filter(
                test__sample__farm__farmer__user=user
            )

        return queryset.filter(
            test__sample__farm__registered_by=user
        )

    def perform_create(self, serializer):
        """
        Create and process a SoilTestResult atomically.

        The workflow is intentionally atomic:

        1. Prevent farmer accounts from creating technical results.
        2. Save the soil test result.
        3. Generate the SoilGenie soil analysis.
        4. Generate the SoilGenie recommendation and validation.
        5. Mark the SoilTest as COMPLETED.
        6. Record tested_at.
        7. Create the assessment-ready notification.
        8. Create a measurement-verification notification only when
           the existing validation engine blocks automatic guidance.

        If any database-backed step raises an exception, the transaction
        is rolled back so the platform does not retain a partially
        processed result.
        """

        user = self.request.user

        ensure_farmer_read_only(user)

        with transaction.atomic():

            # ----------------------------------------------------------------
            # 1. SAVE RESULT
            # ----------------------------------------------------------------

            soil_test_result = serializer.save()

            # ----------------------------------------------------------------
            # 2. GET RELATED TEST
            # ----------------------------------------------------------------

            soil_test = soil_test_result.test

            # ----------------------------------------------------------------
            # 3. GENERATE SOIL ANALYSIS
            # ----------------------------------------------------------------
            #
            # Do this before setting the test to COMPLETED.
            #
            # If analysis generation fails, the result creation is rolled
            # back and the test remains in its previous state.
            # ----------------------------------------------------------------

            generate_soil_analysis(
                soil_test_result
            )

            # ----------------------------------------------------------------
            # 4. GENERATE RECOMMENDATION + MEASUREMENT VALIDATION
            # ----------------------------------------------------------------

            recommendation = (
                generate_recommendations(
                    soil_test_result
                )
            )

            measurement_validation = (
                recommendation.get(
                    "measurement_validation"
                )
                or {}
            )

            # ----------------------------------------------------------------
            # 5. MARK TEST COMPLETED
            # ----------------------------------------------------------------
            #
            # A test reaches COMPLETED only after its result has been saved
            # and the required SoilGenie processing has succeeded.
            # ----------------------------------------------------------------

            soil_test.status = "COMPLETED"
            soil_test.tested_at = timezone.now()

            soil_test.save(
                update_fields=[
                    "status",
                    "tested_at",
                    "updated_at",
                ]
            )

            # ----------------------------------------------------------------
            # 6. ASSESSMENT-READY NOTIFICATION
            # ----------------------------------------------------------------

            notify_soil_assessment_completed(
                soil_test
            )

            # ----------------------------------------------------------------
            # 7. MEASUREMENT VERIFICATION NOTIFICATION
            # ----------------------------------------------------------------
            #
            # The existing notification service decides whether a warning
            # is actually necessary based on measurement_validation.
            # ----------------------------------------------------------------

            notify_measurement_verification_required(
                soil_test,
                measurement_validation,
            )

    def perform_update(self, serializer):
        ensure_farmer_read_only(
            self.request.user
        )

        serializer.save()

    def perform_destroy(self, instance):
        ensure_farmer_read_only(
            self.request.user
        )

        instance.delete()

    # =========================================================================
    # RECOMMENDATION ENDPOINT
    # =========================================================================

    @action(
        detail=True,
        methods=["get"],
        url_path="recommendation",
    )
    def recommendation(
        self,
        request,
        pk=None,
    ):
        """
        Return the complete SoilGenie decision-support recommendation
        for a single soil test result.

        Access is automatically restricted by get_queryset(), so a
        farmer can only request recommendations for their own farms.

        Endpoint:

            GET /api/soil/results/<id>/recommendation/
        """

        # --------------------------------------------------------------------
        # LOAD AUTHORISED RESULT
        # --------------------------------------------------------------------

        soil_test_result = self.get_object()

        # --------------------------------------------------------------------
        # RUN THE EXISTING RECOMMENDATION ENGINE
        # --------------------------------------------------------------------

        recommendation = (
            generate_recommendations(
                soil_test_result
            )
        )

        # --------------------------------------------------------------------
        # BUILD API RESPONSE
        # --------------------------------------------------------------------

        response_data = {
            "result_id": str(
                soil_test_result.id
            ),

            "sample_id": (
                soil_test_result
                .test
                .sample
                .sample_id
            ),

            "test_id": str(
                soil_test_result
                .test
                .test_id
            ),

            "measurement_validation": (
                recommendation.get(
                    "measurement_validation"
                )
            ),

            "best_crop": (
                recommendation.get(
                    "best_crop"
                )
            ),

            "provisional_best_crop": (
                recommendation.get(
                    "provisional_best_crop"
                )
            ),

            "soil_conditions": (
                recommendation.get(
                    "soil_conditions",
                    {}
                )
            ),

            "crop_recommendations": (
                recommendation.get(
                    "crop_recommendations",
                    {}
                )
            ),

            "farmer_summary": (
                recommendation.get(
                    "farmer_summary",
                    ""
                )
            ),
        }

        return Response(
            response_data,
            status=status.HTTP_200_OK,
        )


# ============================================================================
# SOIL ANALYSIS
# ============================================================================


class SoilAnalysisViewSet(viewsets.ModelViewSet):
    queryset = (
        SoilAnalysis.objects
        .select_related(
            "test",
            "test__sample",
            "test__sample__farm",
            "test__sample__farm__farmer",
            "test__sample__farm__farmer__user",
            "test__sample__farm__registered_by",
        )
        .all()
    )

    serializer_class = SoilAnalysisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = super().get_queryset()

        # --------------------------------------------------------------------
        # ROLE-BASED DATA ACCESS
        # --------------------------------------------------------------------

        if is_admin(user):
            pass

        elif is_farmer(user):
            queryset = queryset.filter(
                test__sample__farm__farmer__user=user
            )

        else:
            queryset = queryset.filter(
                test__sample__farm__registered_by=user
            )

        # --------------------------------------------------------------------
        # EXISTING FILTERS
        # --------------------------------------------------------------------

        test_id = (
            self.request.query_params.get(
                "test"
            )
        )

        sample_id = (
            self.request.query_params.get(
                "sample"
            )
        )

        if test_id:
            queryset = queryset.filter(
                test_id=test_id
            )

        if sample_id:
            queryset = queryset.filter(
                test__sample_id=sample_id
            )

        return queryset

    def perform_create(self, serializer):
        ensure_farmer_read_only(
            self.request.user
        )

        serializer.save()

    def perform_update(self, serializer):
        ensure_farmer_read_only(
            self.request.user
        )

        serializer.save()

    def perform_destroy(self, instance):
        ensure_farmer_read_only(
            self.request.user
        )

        instance.delete()