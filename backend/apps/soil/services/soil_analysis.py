from decimal import Decimal

from ..models import SoilAnalysis, SoilTestResult


# ============================================================================
# PARAMETER CLASSIFICATION
# ============================================================================


def classify_ph(ph):
    """
    Basic soil pH interpretation.

    These categories are intentionally conservative.
    Crop-specific interpretation will be added later.
    """

    if ph is None:
        return "UNKNOWN"

    ph = Decimal(str(ph))

    if ph < Decimal("5.5"):
        return "ACIDIC"

    if ph <= Decimal("7.5"):
        return "OPTIMAL"

    return "ALKALINE"


def classify_nitrogen(nitrogen):
    """
    Preliminary nitrogen interpretation.

    The thresholds are a first-pass rule set and should
    later be calibrated against the laboratory method,
    soil type, crop, and regional agronomic standards.
    """

    if nitrogen is None:
        return "UNKNOWN"

    nitrogen = Decimal(str(nitrogen))

    if nitrogen < Decimal("20"):
        return "LOW"

    if nitrogen <= Decimal("50"):
        return "ADEQUATE"

    return "HIGH"


def classify_phosphorus(phosphorus):
    """
    Preliminary phosphorus interpretation.
    """

    if phosphorus is None:
        return "UNKNOWN"

    phosphorus = Decimal(str(phosphorus))

    if phosphorus < Decimal("15"):
        return "LOW"

    if phosphorus <= Decimal("30"):
        return "ADEQUATE"

    return "HIGH"


def classify_potassium(potassium):
    """
    Preliminary potassium interpretation.
    """

    if potassium is None:
        return "UNKNOWN"

    potassium = Decimal(str(potassium))

    if potassium < Decimal("50"):
        return "LOW"

    if potassium <= Decimal("150"):
        return "ADEQUATE"

    return "HIGH"


def classify_moisture(moisture):
    """
    Preliminary soil moisture interpretation.

    This is a general screening rule only.

    Actual optimal moisture depends heavily on soil
    texture, crop, weather, and measurement method.
    """

    if moisture is None:
        return "UNKNOWN"

    moisture = Decimal(str(moisture))

    if moisture < Decimal("20"):
        return "LOW"

    if moisture <= Decimal("60"):
        return "ADEQUATE"

    return "HIGH"


def classify_organic_matter(organic_matter):
    """
    Preliminary organic matter interpretation.
    """

    if organic_matter is None:
        return "UNKNOWN"

    organic_matter = Decimal(
        str(organic_matter)
    )

    if organic_matter < Decimal("2"):
        return "LOW"

    if organic_matter <= Decimal("5"):
        return "ADEQUATE"

    return "HIGH"


def classify_ec(ec):
    """
    Electrical conductivity screening.

    EC is expressed in dS/m.

    Higher values indicate increasing salinity risk.
    """

    if ec is None:
        return "UNKNOWN"

    ec = Decimal(str(ec))

    if ec < Decimal("2"):
        return "LOW"

    if ec <= Decimal("4"):
        return "MODERATE"

    if ec <= Decimal("8"):
        return "HIGH"

    return "CRITICAL"


# ============================================================================
# SOIL HEALTH SCORE
# ============================================================================


def calculate_soil_health_score(
    ph_status,
    nitrogen_status,
    phosphorus_status,
    potassium_status,
    moisture_status,
    organic_matter_status,
    ec_status,
):
    """
    Calculate an initial soil-health score.

    This is a transparent screening score, not a
    laboratory-certified soil-health index.
    """

    score = Decimal("0")
    counted_parameters = 0

    parameter_scores = {
        "ph": {
            "OPTIMAL": 100,
            "ACIDIC": 45,
            "ALKALINE": 60,
        },
        "nitrogen": {
            "LOW": 40,
            "ADEQUATE": 100,
            "HIGH": 70,
        },
        "phosphorus": {
            "LOW": 40,
            "ADEQUATE": 100,
            "HIGH": 70,
        },
        "potassium": {
            "LOW": 40,
            "ADEQUATE": 100,
            "HIGH": 70,
        },
        "moisture": {
            "LOW": 50,
            "ADEQUATE": 100,
            "HIGH": 65,
        },
        "organic_matter": {
            "LOW": 45,
            "ADEQUATE": 100,
            "HIGH": 90,
        },
        "ec": {
            "LOW": 100,
            "MODERATE": 70,
            "HIGH": 40,
            "CRITICAL": 10,
        },
    }

    statuses = [
        ("ph", ph_status),
        ("nitrogen", nitrogen_status),
        ("phosphorus", phosphorus_status),
        ("potassium", potassium_status),
        ("moisture", moisture_status),
        ("organic_matter", organic_matter_status),
        ("ec", ec_status),
    ]

    for parameter, parameter_status in statuses:
        if parameter_status == "UNKNOWN":
            continue

        parameter_score = parameter_scores[
            parameter
        ].get(parameter_status)

        if parameter_score is None:
            continue

        score += Decimal(
            str(parameter_score)
        )

        counted_parameters += 1

    if counted_parameters == 0:
        return None

    return round(
        score / counted_parameters,
        2,
    )


def determine_overall_status(score):
    """
    Convert the numerical score into an overall status.
    """

    if score is None:
        return "MODERATE"

    score = Decimal(str(score))

    if score >= Decimal("80"):
        return "GOOD"

    if score >= Decimal("60"):
        return "MODERATE"

    if score >= Decimal("40"):
        return "POOR"

    return "CRITICAL"


# ============================================================================
# SUMMARY
# ============================================================================


def build_summary(
    ph_status,
    nitrogen_status,
    phosphorus_status,
    potassium_status,
    moisture_status,
    organic_matter_status,
    ec_status,
    overall_status,
):
    """
    Create a farmer-friendly summary.
    """

    issues = []

    if ph_status == "ACIDIC":
        issues.append(
            "The soil is acidic."
        )

    elif ph_status == "ALKALINE":
        issues.append(
            "The soil is alkaline."
        )

    if nitrogen_status == "LOW":
        issues.append(
            "Nitrogen appears to be low."
        )

    if phosphorus_status == "LOW":
        issues.append(
            "Phosphorus appears to be low."
        )

    if potassium_status == "LOW":
        issues.append(
            "Potassium appears to be low."
        )

    if moisture_status == "LOW":
        issues.append(
            "Soil moisture appears to be low."
        )

    if moisture_status == "HIGH":
        issues.append(
            "Soil moisture appears to be high."
        )

    if organic_matter_status == "LOW":
        issues.append(
            "Organic matter appears to be low."
        )

    if ec_status in [
        "HIGH",
        "CRITICAL",
    ]:
        issues.append(
            "Electrical conductivity indicates "
            "a potential salinity concern."
        )

    if not issues:
        return (
            f"The soil currently has a "
            f"{overall_status.lower()} overall "
            f"screening status with no major "
            f"issues identified by the initial "
            f"rule-based assessment."
        )

    return (
        f"The soil has a "
        f"{overall_status.lower()} overall "
        f"screening status. "
        + " ".join(issues)
    )


# ============================================================================
# RECOMMENDATIONS
# ============================================================================


def build_recommendations(
    ph_status,
    nitrogen_status,
    phosphorus_status,
    potassium_status,
    moisture_status,
    organic_matter_status,
    ec_status,
):
    """
    Generate preliminary management recommendations.

    These are screening recommendations only.

    Final fertilizer rates should be based on
    crop requirements, soil type, laboratory method,
    and qualified agronomic guidance.
    """

    recommendations = []

    fertilizer_recommendation = (
        "No specific fertilizer recommendation "
        "has been generated yet."
    )

    amendment_recommendation = (
        "No specific soil amendment recommendation "
        "has been generated yet."
    )

    irrigation_recommendation = (
        "Maintain irrigation according to crop "
        "water requirements and local weather "
        "conditions."
    )

    crop_recommendation = (
        "Crop suitability will be assessed in the "
        "crop-specific recommendation module."
    )

    # ------------------------------------------------------------------------
    # pH
    # ------------------------------------------------------------------------

    if ph_status == "ACIDIC":
        recommendations.append(
            "The soil is acidic. Consider an "
            "appropriate liming strategy after "
            "confirming soil-test results and "
            "crop requirements."
        )

        amendment_recommendation = (
            "Consider an appropriate liming "
            "amendment based on verified soil "
            "test results, soil type, and crop "
            "requirements. Do not apply a fixed "
            "lime rate without agronomic guidance."
        )

    elif ph_status == "ALKALINE":
        recommendations.append(
            "The soil is alkaline. Consider "
            "crop suitability and nutrient "
            "availability before selecting "
            "amendments."
        )

        amendment_recommendation = (
            "Review soil pH together with crop "
            "requirements and verified soil-test "
            "results before selecting any amendment."
        )

    # ------------------------------------------------------------------------
    # Nitrogen
    # ------------------------------------------------------------------------

    if nitrogen_status == "LOW":
        recommendations.append(
            "Nitrogen appears low. Consider "
            "appropriate nitrogen management "
            "based on the intended crop and "
            "verified fertilizer requirements."
        )

        fertilizer_recommendation = (
            "Consider a crop-specific nitrogen "
            "management plan. Exact fertilizer "
            "rates should be calculated from "
            "the crop requirement and validated "
            "soil-test data."
        )

    # ------------------------------------------------------------------------
    # Phosphorus
    # ------------------------------------------------------------------------

    if phosphorus_status == "LOW":
        recommendations.append(
            "Phosphorus appears low. Consider "
            "a crop-appropriate phosphorus "
            "management strategy."
        )

        if nitrogen_status != "LOW":
            fertilizer_recommendation = (
                "Consider a crop-specific phosphorus "
                "management plan based on verified "
                "soil-test data and crop requirements."
            )

    # ------------------------------------------------------------------------
    # Potassium
    # ------------------------------------------------------------------------

    if potassium_status == "LOW":
        recommendations.append(
            "Potassium appears low. Consider "
            "a crop-appropriate potassium "
            "management strategy."
        )

        if (
            nitrogen_status != "LOW"
            and phosphorus_status != "LOW"
        ):
            fertilizer_recommendation = (
                "Consider a crop-specific potassium "
                "management plan based on verified "
                "soil-test data and crop requirements."
            )

    # ------------------------------------------------------------------------
    # Moisture
    # ------------------------------------------------------------------------

    if moisture_status == "LOW":
        recommendations.append(
            "Soil moisture appears low. Review "
            "irrigation timing and soil-water "
            "management."
        )

        irrigation_recommendation = (
            "Review irrigation frequency and "
            "timing. Adjust according to crop "
            "water requirements, soil texture, "
            "rainfall, and field conditions."
        )

    elif moisture_status == "HIGH":
        recommendations.append(
            "Soil moisture appears high. Monitor "
            "drainage and avoid unnecessary "
            "irrigation."
        )

        irrigation_recommendation = (
            "Avoid unnecessary irrigation and "
            "check field drainage before adding "
            "more water."
        )

    # ------------------------------------------------------------------------
    # Organic matter
    # ------------------------------------------------------------------------

    if organic_matter_status == "LOW":
        recommendations.append(
            "Organic matter appears low. Consider "
            "appropriate soil organic-matter "
            "management based on local conditions "
            "and agronomic guidance."
        )

    # ------------------------------------------------------------------------
    # Electrical conductivity
    # ------------------------------------------------------------------------

    if ec_status == "MODERATE":
        recommendations.append(
            "Electrical conductivity is moderately "
            "elevated. Monitor salinity together "
            "with crop tolerance and field conditions."
        )

    elif ec_status == "HIGH":
        recommendations.append(
            "Electrical conductivity indicates "
            "a potential salinity concern. Review "
            "the result before making crop or soil "
            "management decisions."
        )

    elif ec_status == "CRITICAL":
        recommendations.append(
            "Electrical conductivity indicates "
            "a serious potential salinity concern. "
            "Confirm the measurement and obtain "
            "appropriate agronomic guidance before "
            "making major soil-management decisions."
        )

    # ------------------------------------------------------------------------
    # Default
    # ------------------------------------------------------------------------

    if not recommendations:
        recommendations.append(
            "No major soil-management issue was "
            "identified by the initial rule-based "
            "screening assessment."
        )

    return {
        "recommendations": " ".join(
            recommendations
        ),
        "fertilizer_recommendation":
            fertilizer_recommendation,
        "amendment_recommendation":
            amendment_recommendation,
        "irrigation_recommendation":
            irrigation_recommendation,
        "crop_recommendation":
            crop_recommendation,
    }


# ============================================================================
# ANALYSIS ORCHESTRATION
# ============================================================================


def generate_soil_analysis(
    soil_test_result: SoilTestResult,
):
    """
    Generate or refresh the SoilAnalysis associated
    with a SoilTestResult.

    This function coordinates the existing SoilGenie
    rule-based screening functions.

    It deliberately does not introduce new numerical
    agronomic thresholds.

    Because SoilAnalysis.test is a OneToOneField,
    update_or_create() is used so that regenerating
    an analysis updates the existing record rather
    than creating a duplicate.
    """

    if not isinstance(
        soil_test_result,
        SoilTestResult,
    ):
        raise TypeError(
            "generate_soil_analysis expects "
            "a SoilTestResult instance."
        )

    soil_test = soil_test_result.test

    # ------------------------------------------------------------------------
    # 1. Classify the measurements
    # ------------------------------------------------------------------------

    ph_status = classify_ph(
        soil_test_result.ph
    )

    nitrogen_status = classify_nitrogen(
        soil_test_result.nitrogen_mg_kg
    )

    phosphorus_status = classify_phosphorus(
        soil_test_result.phosphorus_mg_kg
    )

    potassium_status = classify_potassium(
        soil_test_result.potassium_mg_kg
    )

    moisture_status = classify_moisture(
        soil_test_result.moisture_percent
    )

    organic_matter_status = (
        classify_organic_matter(
            soil_test_result.organic_matter_percent
        )
    )

    ec_status = classify_ec(
        soil_test_result.electrical_conductivity_ds_m
    )

    # ------------------------------------------------------------------------
    # 2. Calculate screening score
    # ------------------------------------------------------------------------

    soil_health_score = (
        calculate_soil_health_score(
            ph_status=ph_status,
            nitrogen_status=nitrogen_status,
            phosphorus_status=phosphorus_status,
            potassium_status=potassium_status,
            moisture_status=moisture_status,
            organic_matter_status=organic_matter_status,
            ec_status=ec_status,
        )
    )

    # ------------------------------------------------------------------------
    # 3. Overall status
    # ------------------------------------------------------------------------

    overall_status = (
        determine_overall_status(
            soil_health_score
        )
    )

    # ------------------------------------------------------------------------
    # 4. Summary
    # ------------------------------------------------------------------------

    summary = build_summary(
        ph_status=ph_status,
        nitrogen_status=nitrogen_status,
        phosphorus_status=phosphorus_status,
        potassium_status=potassium_status,
        moisture_status=moisture_status,
        organic_matter_status=organic_matter_status,
        ec_status=ec_status,
        overall_status=overall_status,
    )

    # ------------------------------------------------------------------------
    # 5. Recommendations
    # ------------------------------------------------------------------------

    recommendation_data = (
        build_recommendations(
            ph_status=ph_status,
            nitrogen_status=nitrogen_status,
            phosphorus_status=phosphorus_status,
            potassium_status=potassium_status,
            moisture_status=moisture_status,
            organic_matter_status=organic_matter_status,
            ec_status=ec_status,
        )
    )

    # ------------------------------------------------------------------------
    # 6. Save analysis
    # ------------------------------------------------------------------------

    analysis, _created = (
        SoilAnalysis.objects.update_or_create(
            test=soil_test,
            defaults={
                "overall_status":
                    overall_status,

                "summary":
                    summary,

                "ph_status":
                    ph_status,

                "nitrogen_status":
                    nitrogen_status,

                "phosphorus_status":
                    phosphorus_status,

                "potassium_status":
                    potassium_status,

                "moisture_status":
                    moisture_status,

                "organic_matter_status":
                    organic_matter_status,

                "recommendations":
                    recommendation_data[
                        "recommendations"
                    ],

                "fertilizer_recommendation":
                    recommendation_data[
                        "fertilizer_recommendation"
                    ],

                "amendment_recommendation":
                    recommendation_data[
                        "amendment_recommendation"
                    ],

                "irrigation_recommendation":
                    recommendation_data[
                        "irrigation_recommendation"
                    ],

                "crop_recommendation":
                    recommendation_data[
                        "crop_recommendation"
                    ],

                "generated_by":
                    "SOILGENIE_RULE_ENGINE",
            },
        )
    )

    return analysis