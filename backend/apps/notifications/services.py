from typing import Optional

from django.contrib.auth import get_user_model

from .models import Notification


User = get_user_model()


def create_notification(
    *,
    recipient,
    notification_type,
    title,
    message,
    priority=Notification.Priority.NORMAL,
    action_url=None,
    farmer=None,
    farm=None,
    soil_sample=None,
    soil_test=None,
    deduplication_key=None,
):
    """
    Create a SoilGenie notification.

    When deduplication_key is supplied, the function checks whether
    a notification with the same recipient, type, title and related
    soil object already exists before creating another one.

    This helps prevent duplicate notifications when a workflow
    operation is repeated or an endpoint is requested more than once.
    """

    if recipient is None:
        return None

    if not getattr(recipient, "is_active", False):
        return None

    if deduplication_key:
        existing = Notification.objects.filter(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
        )

        if soil_sample is not None:
            existing = existing.filter(
                soil_sample=soil_sample
            )

        if soil_test is not None:
            existing = existing.filter(
                soil_test=soil_test
            )

        if existing.exists():
            return existing.first()

    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        priority=priority,
        title=title,
        message=message,
        action_url=action_url,
        farmer=farmer,
        farm=farm,
        soil_sample=soil_sample,
        soil_test=soil_test,
    )


# ============================================================
# RECIPIENT HELPERS
# ============================================================


def get_agent_for_sample(soil_sample):
    """
    Return the agent/user responsible for the sample.

    SoilSample.collected_by is the most direct operational
    ownership link for samples collected through the agent
    workflow.
    """

    return getattr(
        soil_sample,
        "collected_by",
        None,
    )


def get_agent_for_test(soil_test):
    """
    Resolve the responsible agent from the test's sample.
    """

    soil_sample = getattr(
        soil_test,
        "sample",
        None,
    )

    if soil_sample is None:
        return None

    return get_agent_for_sample(
        soil_sample
    )


def get_farmer_user_from_sample(
    soil_sample,
):
    """
    Resolve the farmer's own login account, when one exists.

    A Farmer record may exist without being linked to a User
    account, so this function safely returns None in that case.
    """

    farm = getattr(
        soil_sample,
        "farm",
        None,
    )

    if farm is None:
        return None

    farmer = getattr(
        farm,
        "farmer",
        None,
    )

    if farmer is None:
        return None

    return getattr(
        farmer,
        "user",
        None,
    )


# ============================================================
# SAMPLE REGISTERED
# ============================================================


def notify_soil_sample_registered(
    soil_sample,
):
    """
    Notify the responsible field agent when a new soil sample
    has been registered.
    """

    recipient = get_agent_for_sample(
        soil_sample
    )

    if recipient is None:
        return None

    farm = getattr(
        soil_sample,
        "farm",
        None,
    )

    farmer = (
        getattr(farm, "farmer", None)
        if farm
        else None
    )

    sample_id = (
        soil_sample.sample_id
    )

    farm_name = (
        farm.farm_name
        if farm
        else "the farm"
    )

    return create_notification(
        recipient=recipient,
        notification_type=(
            Notification.NotificationType.SOIL_SAMPLE
        ),
        priority=(
            Notification.Priority.NORMAL
        ),
        title="Soil sample registered",
        message=(
            f"Sample {sample_id} has been "
            f"registered for {farm_name}. "
            "Create a soil test when the "
            "sample is ready for testing."
        ),
        action_url=(
            f"/agent/soil/samples/"
            f"{soil_sample.id}"
        ),
        farmer=farmer,
        farm=farm,
        soil_sample=soil_sample,
        deduplication_key=(
            f"sample-registered-"
            f"{soil_sample.id}"
        ),
    )


# ============================================================
# SOIL TEST CREATED
# ============================================================


def notify_soil_test_created(
    soil_test,
):
    """
    Notify the responsible agent that a soil test has been
    created and is awaiting the next workflow step.
    """

    soil_sample = getattr(
        soil_test,
        "sample",
        None,
    )

    if soil_sample is None:
        return None

    recipient = get_agent_for_test(
        soil_test
    )

    if recipient is None:
        return None

    farm = getattr(
        soil_sample,
        "farm",
        None,
    )

    farmer = (
        getattr(farm, "farmer", None)
        if farm
        else None
    )

    return create_notification(
        recipient=recipient,
        notification_type=(
            Notification.NotificationType.SOIL_TEST
        ),
        priority=(
            Notification.Priority.NORMAL
        ),
        title="Soil test awaiting results",
        message=(
            f"A soil test has been created "
            f"for sample "
            f"{soil_sample.sample_id}. "
            "Enter the verified soil "
            "measurements to continue the "
            "assessment."
        ),
        action_url=(
            f"/agent/soil/tests/"
            f"{soil_test.id}"
        ),
        farmer=farmer,
        farm=farm,
        soil_sample=soil_sample,
        soil_test=soil_test,
        deduplication_key=(
            f"test-created-"
            f"{soil_test.id}"
        ),
    )


# ============================================================
# ASSESSMENT COMPLETED
# ============================================================


def notify_soil_assessment_completed(
    soil_test,
):
    """
    Notify the responsible agent when a soil assessment/report
    becomes available.
    """

    soil_sample = getattr(
        soil_test,
        "sample",
        None,
    )

    if soil_sample is None:
        return None

    recipient = get_agent_for_test(
        soil_test
    )

    if recipient is None:
        return None

    farm = getattr(
        soil_sample,
        "farm",
        None,
    )

    farmer = (
        getattr(farm, "farmer", None)
        if farm
        else None
    )

    return create_notification(
        recipient=recipient,
        notification_type=(
            Notification.NotificationType.SOIL_REPORT
        ),
        priority=(
            Notification.Priority.NORMAL
        ),
        title="Soil assessment ready",
        message=(
            f"The soil assessment for sample "
            f"{soil_sample.sample_id} is now "
            "available. Review the report "
            "before sharing guidance with "
            "the farmer."
        ),
        action_url=(
            f"/agent/reports/soil/"
            f"{soil_test.id}"
        ),
        farmer=farmer,
        farm=farm,
        soil_sample=soil_sample,
        soil_test=soil_test,
        deduplication_key=(
            f"assessment-ready-"
            f"{soil_test.id}"
        ),
    )


# ============================================================
# MEASUREMENT VERIFICATION WARNING
# ============================================================


def notify_measurement_verification_required(
    soil_test,
    measurement_validation,
):
    """
    Create a warning when SoilGenie's measurement-validation
    safety gate blocks automatic crop recommendations.

    This function does not perform agronomic validation itself.
    It only reacts to the result already produced by the
    existing recommendation engine.
    """

    if not measurement_validation:
        return None

    recommendation_blocked = (
        measurement_validation.get(
            "recommendation_blocked",
            False,
        )
    )

    if not recommendation_blocked:
        return None

    soil_sample = getattr(
        soil_test,
        "sample",
        None,
    )

    if soil_sample is None:
        return None

    recipient = get_agent_for_test(
        soil_test
    )

    if recipient is None:
        return None

    farm = getattr(
        soil_sample,
        "farm",
        None,
    )

    farmer = (
        getattr(farm, "farmer", None)
        if farm
        else None
    )

    critical_measurements = (
        measurement_validation.get(
            "critical_measurements",
            [],
        )
        or []
    )

    warning_measurements = (
        measurement_validation.get(
            "warning_measurements",
            [],
        )
        or []
    )

    affected_measurements = (
        critical_measurements
        or warning_measurements
    )

    if affected_measurements:
        readable_measurements = ", ".join(
            str(item)
            .replace("_", " ")
            .title()
            for item
            in affected_measurements
        )

        detail = (
            f"Measurements requiring review: "
            f"{readable_measurements}."
        )
    else:
        detail = (
            "One or more measurements "
            "require verification."
        )

    priority = (
        Notification.Priority.CRITICAL
        if critical_measurements
        else Notification.Priority.HIGH
    )

    return create_notification(
        recipient=recipient,
        notification_type=(
            Notification.NotificationType.MEASUREMENT_WARNING
        ),
        priority=priority,
        title=(
            "Soil measurement requires verification"
        ),
        message=(
            f"Sample "
            f"{soil_sample.sample_id} contains "
            "soil measurements that require "
            "verification before automatic crop "
            f"guidance is shared. {detail}"
        ),
        action_url=(
            f"/agent/soil/tests/"
            f"{soil_test.id}"
        ),
        farmer=farmer,
        farm=farm,
        soil_sample=soil_sample,
        soil_test=soil_test,
        deduplication_key=(
            f"measurement-warning-"
            f"{soil_test.id}"
        ),
    )