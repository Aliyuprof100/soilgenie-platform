from decimal import Decimal, InvalidOperation


# ============================================================================
# SOILGENIE MEASUREMENT VALIDATION ENGINE
# ============================================================================

"""
SoilGenie Measurement Validation Engine

Purpose
-------
Detect potentially abnormal, impossible, suspicious, or inconsistent
soil sensor measurements before they are used for agricultural
recommendations.

This module evaluates:

    - completeness
    - numerical validity
    - sensor plausibility
    - suspicious values
    - measurement-quality problems

It does NOT diagnose soil.

Statuses:

    VALID
    WARNING
    CRITICAL
    MISSING
    INCOMPLETE

Recommendation safety:

    READY
    CAUTION
    LIMITED
    BLOCKED
"""


# ============================================================================
# PLAUSIBILITY LIMITS
# ============================================================================

# These are engineering/data-quality limits.
# They are NOT agronomic recommendations.

PH_MIN = Decimal("0")
PH_MAX = Decimal("14")

NITROGEN_MIN = Decimal("0")
NITROGEN_MAX = Decimal("10000")

PHOSPHORUS_MIN = Decimal("0")
PHOSPHORUS_MAX = Decimal("10000")

POTASSIUM_MIN = Decimal("0")
POTASSIUM_MAX = Decimal("10000")

MOISTURE_MIN = Decimal("0")
MOISTURE_MAX = Decimal("100")

ORGANIC_MATTER_MIN = Decimal("0")
ORGANIC_MATTER_MAX = Decimal("100")

TEMPERATURE_MIN = Decimal("-20")
TEMPERATURE_MAX = Decimal("80")

EC_MIN = Decimal("0")
EC_MAX = Decimal("100")


# ============================================================================
# WARNING LIMITS
# ============================================================================

EC_WARNING = Decimal("4")
EC_HIGH_WARNING = Decimal("8")

# Extremely high EC requires independent confirmation.
EC_CRITICAL_CONFIRMATION = Decimal("16")

TEMPERATURE_WARNING_LOW = Decimal("0")
TEMPERATURE_WARNING_HIGH = Decimal("45")

ORGANIC_MATTER_WARNING = Decimal("20")


# ============================================================================
# HELPERS
# ============================================================================

def to_decimal(value):
    """
    Safely convert a value to Decimal.

    Returns:
        Decimal
        None
    """

    if value is None:
        return None

    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def build_measurement(
    parameter,
    value,
    status,
    severity,
    message=None,
):
    """
    Standardize measurement validation output.
    """

    return {
        "parameter": parameter,
        "value": value,
        "status": status,
        "severity": severity,
        "message": message,
    }


# ============================================================================
# INDIVIDUAL MEASUREMENT VALIDATION
# ============================================================================

def validate_ph(value):
    converted = to_decimal(value)

    if converted is None:
        return build_measurement(
            "pH",
            None,
            "MISSING",
            "UNKNOWN",
            "pH measurement is missing or invalid.",
        )

    if converted < PH_MIN or converted > PH_MAX:
        return build_measurement(
            "pH",
            converted,
            "CRITICAL",
            "CRITICAL",
            "pH reading is outside the physically plausible 0–14 range.",
        )

    return build_measurement(
        "pH",
        converted,
        "VALID",
        "NORMAL",
    )


def validate_nitrogen(value):
    converted = to_decimal(value)

    if converted is None:
        return build_measurement(
            "Nitrogen",
            None,
            "MISSING",
            "UNKNOWN",
            "Nitrogen measurement is missing or invalid.",
        )

    if converted < NITROGEN_MIN or converted > NITROGEN_MAX:
        return build_measurement(
            "Nitrogen",
            converted,
            "CRITICAL",
            "CRITICAL",
            "Nitrogen reading is outside the configured "
            "measurement plausibility range.",
        )

    return build_measurement(
        "Nitrogen",
        converted,
        "VALID",
        "NORMAL",
    )


def validate_phosphorus(value):
    converted = to_decimal(value)

    if converted is None:
        return build_measurement(
            "Phosphorus",
            None,
            "MISSING",
            "UNKNOWN",
            "Phosphorus measurement is missing or invalid.",
        )

    if converted < PHOSPHORUS_MIN or converted > PHOSPHORUS_MAX:
        return build_measurement(
            "Phosphorus",
            converted,
            "CRITICAL",
            "CRITICAL",
            "Phosphorus reading is outside the configured "
            "measurement plausibility range.",
        )

    return build_measurement(
        "Phosphorus",
        converted,
        "VALID",
        "NORMAL",
    )


def validate_potassium(value):
    converted = to_decimal(value)

    if converted is None:
        return build_measurement(
            "Potassium",
            None,
            "MISSING",
            "UNKNOWN",
            "Potassium measurement is missing or invalid.",
        )

    if converted < POTASSIUM_MIN or converted > POTASSIUM_MAX:
        return build_measurement(
            "Potassium",
            converted,
            "CRITICAL",
            "CRITICAL",
            "Potassium reading is outside the configured "
            "measurement plausibility range.",
        )

    return build_measurement(
        "Potassium",
        converted,
        "VALID",
        "NORMAL",
    )


def validate_moisture(value):
    converted = to_decimal(value)

    if converted is None:
        return build_measurement(
            "Moisture",
            None,
            "MISSING",
            "UNKNOWN",
            "Moisture measurement is missing or invalid.",
        )

    if converted < MOISTURE_MIN or converted > MOISTURE_MAX:
        return build_measurement(
            "Moisture",
            converted,
            "CRITICAL",
            "CRITICAL",
            "Moisture percentage is outside the valid 0–100% range.",
        )

    return build_measurement(
        "Moisture",
        converted,
        "VALID",
        "NORMAL",
    )


def validate_organic_matter(value):
    converted = to_decimal(value)

    if converted is None:
        return build_measurement(
            "Organic matter",
            None,
            "MISSING",
            "UNKNOWN",
            "Organic matter measurement is missing or invalid.",
        )

    if converted < ORGANIC_MATTER_MIN or converted > ORGANIC_MATTER_MAX:
        return build_measurement(
            "Organic matter",
            converted,
            "CRITICAL",
            "CRITICAL",
            "Organic matter percentage is outside the valid 0–100% range.",
        )

    if converted > ORGANIC_MATTER_WARNING:
        return build_measurement(
            "Organic matter",
            converted,
            "WARNING",
            "MODERATE",
            "Organic matter value is unusually high and should be confirmed.",
        )

    return build_measurement(
        "Organic matter",
        converted,
        "VALID",
        "NORMAL",
    )


def validate_temperature(value):
    converted = to_decimal(value)

    if converted is None:
        return build_measurement(
            "Temperature",
            None,
            "MISSING",
            "UNKNOWN",
            "Temperature measurement is missing or invalid.",
        )

    if converted < TEMPERATURE_MIN or converted > TEMPERATURE_MAX:
        return build_measurement(
            "Temperature",
            converted,
            "CRITICAL",
            "CRITICAL",
            "Temperature is outside the configured sensor "
            "plausibility range.",
        )

    if (
        converted < TEMPERATURE_WARNING_LOW
        or converted > TEMPERATURE_WARNING_HIGH
    ):
        return build_measurement(
            "Temperature",
            converted,
            "WARNING",
            "MODERATE",
            "Temperature is unusual and should be confirmed "
            "before relying heavily on this measurement.",
        )

    return build_measurement(
        "Temperature",
        converted,
        "VALID",
        "NORMAL",
    )


def validate_ec(value):
    """
    Validate electrical conductivity.

    EC is treated as a special safety measurement because an extreme
    value can dramatically alter crop suitability calculations.
    """

    converted = to_decimal(value)

    if converted is None:
        return build_measurement(
            "Electrical conductivity",
            None,
            "MISSING",
            "UNKNOWN",
            "Electrical conductivity measurement is missing or invalid.",
        )

    if converted < EC_MIN or converted > EC_MAX:
        return build_measurement(
            "Electrical conductivity",
            converted,
            "CRITICAL",
            "CRITICAL",
            "Electrical conductivity is outside the configured "
            "sensor plausibility range.",
        )

    if converted > EC_CRITICAL_CONFIRMATION:
        return build_measurement(
            "Electrical conductivity",
            converted,
            "CRITICAL",
            "CRITICAL",
            "Electrical conductivity is extremely high and must be "
            "confirmed with a reliable measurement method before "
            "automatic crop recommendations are made.",
        )

    if converted > EC_HIGH_WARNING:
        return build_measurement(
            "Electrical conductivity",
            converted,
            "WARNING",
            "HIGH",
            "Electrical conductivity is unusually high and should "
            "be confirmed before crop recommendations are made.",
        )

    if converted > EC_WARNING:
        return build_measurement(
            "Electrical conductivity",
            converted,
            "WARNING",
            "MODERATE",
            "Electrical conductivity indicates a possible salinity "
            "concern and may require confirmation.",
        )

    return build_measurement(
        "Electrical conductivity",
        converted,
        "VALID",
        "NORMAL",
    )


# ============================================================================
# COMPLETE SOIL TEST VALIDATION
# ============================================================================

def validate_soil_measurements(result):
    """
    Validate all measurements contained in a SoilTestResult.

    Returns a structured validation report.
    """

    measurements = {
        "ph": validate_ph(
            result.ph
        ),

        "nitrogen": validate_nitrogen(
            result.nitrogen_mg_kg
        ),

        "phosphorus": validate_phosphorus(
            result.phosphorus_mg_kg
        ),

        "potassium": validate_potassium(
            result.potassium_mg_kg
        ),

        "moisture": validate_moisture(
            result.moisture_percent
        ),

        "organic_matter": validate_organic_matter(
            result.organic_matter_percent
        ),

        "temperature": validate_temperature(
            result.temperature_celsius
        ),

        "ec": validate_ec(
            result.electrical_conductivity_ds_m
        ),
    }

    critical_measurements = []
    warning_measurements = []
    missing_measurements = []

    for measurement in measurements.values():

        status = measurement["status"]

        if status == "CRITICAL":
            critical_measurements.append(measurement)

        elif status == "WARNING":
            warning_measurements.append(measurement)

        elif status == "MISSING":
            missing_measurements.append(measurement)

    # ========================================================================
    # OVERALL STATUS
    # ========================================================================

    if critical_measurements:
        overall_status = "CRITICAL"

    elif warning_measurements:
        overall_status = "WARNING"

    elif missing_measurements:
        overall_status = "INCOMPLETE"

    else:
        overall_status = "VALID"

    # ========================================================================
    # RECOMMENDATION SAFETY
    # ========================================================================

    if critical_measurements:

        recommendation_status = "BLOCKED"

    elif missing_measurements:

        recommendation_status = "LIMITED"

    elif warning_measurements:

        recommendation_status = "CAUTION"

    else:

        recommendation_status = "READY"

    recommendation_blocked = (
        recommendation_status == "BLOCKED"
    )

    # ========================================================================
    # HUMAN-READABLE SUMMARY
    # ========================================================================

    if recommendation_status == "BLOCKED":

        summary = (
            "Automatic crop recommendations are blocked because "
            "one or more soil measurements require confirmation."
        )

    elif recommendation_status == "LIMITED":

        summary = (
            "Crop recommendations are limited because one or more "
            "soil measurements are missing."
        )

    elif recommendation_status == "CAUTION":

        summary = (
            "Measurements contain warnings. Crop recommendations "
            "should be interpreted with caution."
        )

    else:

        summary = (
            "All available soil measurements passed the configured "
            "measurement-quality checks."
        )

    return {
        "overall_status": overall_status,
        "recommendation_status": recommendation_status,
        "recommendation_blocked": recommendation_blocked,
        "summary": summary,
        "measurements": measurements,
        "critical_measurements": critical_measurements,
        "warning_measurements": warning_measurements,
        "missing_measurements": missing_measurements,
    }