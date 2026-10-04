from decimal import Decimal, InvalidOperation


# ============================================================================
# SOILGENIE CROP SUITABILITY ENGINE
# ============================================================================

"""
SoilGenie Crop Suitability Engine

Purpose
-------
Compare soil measurements against crop-specific screening requirements.

IMPORTANT
---------
This is a decision-support screening engine.

It is NOT a substitute for:

    - laboratory soil testing
    - agronomic expertise
    - local extension recommendations
    - field inspection
    - crop-specific management planning

The engine performs two separate tasks:

    1. Provisional suitability scoring
    2. Crop-specific constraint detection

The recommendation engine decides whether the resulting score
may safely be presented as an automatic recommendation.
"""


# ============================================================================
# CROP SCREENING PROFILES
# ============================================================================

CROP_PROFILES = {

    "Cowpea": {
        "ph": {
            "min": Decimal("5.5"),
            "max": Decimal("7.5"),
        },
        "nitrogen": {
            "min": Decimal("20"),
            "max": Decimal("100"),
        },
        "phosphorus": {
            "min": Decimal("10"),
            "max": Decimal("100"),
        },
        "potassium": {
            "min": Decimal("80"),
            "max": Decimal("500"),
        },
        "moisture": {
            "min": Decimal("20"),
            "max": Decimal("70"),
        },
        "ec_max": Decimal("4"),
    },

    "Groundnut": {
        "ph": {
            "min": Decimal("5.5"),
            "max": Decimal("7.0"),
        },
        "nitrogen": {
            "min": Decimal("20"),
            "max": Decimal("100"),
        },
        "phosphorus": {
            "min": Decimal("10"),
            "max": Decimal("100"),
        },
        "potassium": {
            "min": Decimal("80"),
            "max": Decimal("500"),
        },
        "moisture": {
            "min": Decimal("20"),
            "max": Decimal("65"),
        },
        "ec_max": Decimal("4"),
    },

    "Pearl Millet": {
        "ph": {
            "min": Decimal("5.5"),
            "max": Decimal("8.0"),
        },
        "nitrogen": {
            "min": Decimal("15"),
            "max": Decimal("100"),
        },
        "phosphorus": {
            "min": Decimal("8"),
            "max": Decimal("100"),
        },
        "potassium": {
            "min": Decimal("60"),
            "max": Decimal("500"),
        },
        "moisture": {
            "min": Decimal("15"),
            "max": Decimal("70"),
        },
        "ec_max": Decimal("8"),
    },

    "Sorghum": {
        "ph": {
            "min": Decimal("5.5"),
            "max": Decimal("8.0"),
        },
        "nitrogen": {
            "min": Decimal("15"),
            "max": Decimal("100"),
        },
        "phosphorus": {
            "min": Decimal("8"),
            "max": Decimal("100"),
        },
        "potassium": {
            "min": Decimal("60"),
            "max": Decimal("500"),
        },
        "moisture": {
            "min": Decimal("15"),
            "max": Decimal("70"),
        },
        "ec_max": Decimal("8"),
    },

    "Rice": {
        "ph": {
            "min": Decimal("5.0"),
            "max": Decimal("7.5"),
        },
        "nitrogen": {
            "min": Decimal("25"),
            "max": Decimal("120"),
        },
        "phosphorus": {
            "min": Decimal("10"),
            "max": Decimal("100"),
        },
        "potassium": {
            "min": Decimal("80"),
            "max": Decimal("500"),
        },
        "moisture": {
            "min": Decimal("30"),
            "max": Decimal("90"),
        },
        "ec_max": Decimal("4"),
    },

    "Maize": {
        "ph": {
            "min": Decimal("5.5"),
            "max": Decimal("7.5"),
        },
        "nitrogen": {
            "min": Decimal("25"),
            "max": Decimal("120"),
        },
        "phosphorus": {
            "min": Decimal("10"),
            "max": Decimal("100"),
        },
        "potassium": {
            "min": Decimal("100"),
            "max": Decimal("500"),
        },
        "moisture": {
            "min": Decimal("25"),
            "max": Decimal("75"),
        },
        "ec_max": Decimal("4"),
    },
}


# ============================================================================
# SCORING WEIGHTS
# ============================================================================

WEIGHTS = {
    "ph": Decimal("25"),
    "nitrogen": Decimal("20"),
    "phosphorus": Decimal("15"),
    "potassium": Decimal("15"),
    "moisture": Decimal("10"),
    "ec": Decimal("15"),
}


# ============================================================================
# HELPERS
# ============================================================================

def to_decimal(value):
    """
    Safely convert a value to Decimal.
    """

    if value is None:
        return None

    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def get_soil_value(result, parameter):
    """
    Extract the relevant soil measurement from SoilTestResult.
    """

    mapping = {
        "ph": result.ph,
        "nitrogen": result.nitrogen_mg_kg,
        "phosphorus": result.phosphorus_mg_kg,
        "potassium": result.potassium_mg_kg,
        "moisture": result.moisture_percent,
        "ec": result.electrical_conductivity_ds_m,
    }

    return to_decimal(
        mapping.get(parameter)
    )


def score_range(
    value,
    minimum,
    maximum,
):
    """
    Return a score between 0 and 1.

    1.0:
        Measurement is inside preferred range.

    Lower values:
        Measurement is increasingly outside preferred range.

    0:
        Measurement is sufficiently far outside the range.
    """

    if value is None:
        return Decimal("0")

    if minimum <= value <= maximum:
        return Decimal("1")

    if value < minimum:

        distance = minimum - value

        denominator = max(
            minimum,
            Decimal("1"),
        )

        score = Decimal("1") - (
            distance / denominator
        )

    else:

        distance = value - maximum

        denominator = max(
            maximum,
            Decimal("1"),
        )

        score = Decimal("1") - (
            distance / denominator
        )

    if score < Decimal("0"):
        score = Decimal("0")

    return score


def score_ec(
    value,
    maximum,
):
    """
    Calculate EC suitability score.

    EC values below or equal to the crop limit receive full score.
    Increasing EC above the crop limit reduces the score.
    """

    if value is None:
        return Decimal("0")

    if value <= maximum:
        return Decimal("1")

    excess = value - maximum

    score = Decimal("1") - (
        excess / maximum
    )

    if score < Decimal("0"):
        score = Decimal("0")

    return score


# ============================================================================
# CROP SCORING
# ============================================================================

def calculate_crop_score(
    result,
    profile,
):
    """
    Calculate weighted crop suitability score.

    Maximum score = 100.

    IMPORTANT:

    This is a PROVISIONAL score.

    The recommendation engine decides whether this score may
    be converted into an automatic farmer recommendation.
    """

    score = Decimal("0")

    # ========================================================================
    # pH
    # ========================================================================

    ph = get_soil_value(
        result,
        "ph",
    )

    if ph is not None:

        score += (
            score_range(
                ph,
                profile["ph"]["min"],
                profile["ph"]["max"],
            )
            * WEIGHTS["ph"]
        )

    # ========================================================================
    # Nitrogen
    # ========================================================================

    nitrogen = get_soil_value(
        result,
        "nitrogen",
    )

    if nitrogen is not None:

        score += (
            score_range(
                nitrogen,
                profile["nitrogen"]["min"],
                profile["nitrogen"]["max"],
            )
            * WEIGHTS["nitrogen"]
        )

    # ========================================================================
    # Phosphorus
    # ========================================================================

    phosphorus = get_soil_value(
        result,
        "phosphorus",
    )

    if phosphorus is not None:

        score += (
            score_range(
                phosphorus,
                profile["phosphorus"]["min"],
                profile["phosphorus"]["max"],
            )
            * WEIGHTS["phosphorus"]
        )

    # ========================================================================
    # Potassium
    # ========================================================================

    potassium = get_soil_value(
        result,
        "potassium",
    )

    if potassium is not None:

        score += (
            score_range(
                potassium,
                profile["potassium"]["min"],
                profile["potassium"]["max"],
            )
            * WEIGHTS["potassium"]
        )

    # ========================================================================
    # Moisture
    # ========================================================================

    moisture = get_soil_value(
        result,
        "moisture",
    )

    if moisture is not None:

        score += (
            score_range(
                moisture,
                profile["moisture"]["min"],
                profile["moisture"]["max"],
            )
            * WEIGHTS["moisture"]
        )

    # ========================================================================
    # Electrical Conductivity
    # ========================================================================

    ec = get_soil_value(
        result,
        "ec",
    )

    if ec is not None:

        score += (
            score_ec(
                ec,
                profile["ec_max"],
            )
            * WEIGHTS["ec"]
        )

    return score


# ============================================================================
# CROP CONSTRAINT ANALYSIS
# ============================================================================

def analyze_crop_constraints(
    result,
    crop_name,
    profile,
):
    """
    Identify strengths, warnings, and critical constraints.
    """

    strengths = []
    warnings = []
    critical_constraints = []

    # ========================================================================
    # pH
    # ========================================================================

    ph = get_soil_value(
        result,
        "ph",
    )

    if ph is not None:

        if (
            profile["ph"]["min"]
            <= ph
            <= profile["ph"]["max"]
        ):

            strengths.append(
                "Soil pH is within the screening range."
            )

        elif ph < profile["ph"]["min"]:

            critical_constraints.append(
                "Soil pH is below the preferred range for this crop."
            )

        else:

            warnings.append(
                "Soil pH is above the preferred range for this crop."
            )

    # ========================================================================
    # Nitrogen
    # ========================================================================

    nitrogen = get_soil_value(
        result,
        "nitrogen",
    )

    if nitrogen is not None:

        if nitrogen >= profile["nitrogen"]["min"]:

            strengths.append(
                "Soil nitrogen meets the screening minimum."
            )

        else:

            warnings.append(
                "Soil nitrogen is below the preferred range."
            )

    # ========================================================================
    # Phosphorus
    # ========================================================================

    phosphorus = get_soil_value(
        result,
        "phosphorus",
    )

    if phosphorus is not None:

        if (
            profile["phosphorus"]["min"]
            <= phosphorus
            <= profile["phosphorus"]["max"]
        ):

            strengths.append(
                "Soil phosphorus is within the screening range."
            )

        elif phosphorus < profile["phosphorus"]["min"]:

            warnings.append(
                "Soil phosphorus is below the preferred range."
            )

        else:

            warnings.append(
                "Soil phosphorus is above the configured screening range."
            )

    # ========================================================================
    # Potassium
    # ========================================================================

    potassium = get_soil_value(
        result,
        "potassium",
    )

    if potassium is not None:

        if (
            profile["potassium"]["min"]
            <= potassium
            <= profile["potassium"]["max"]
        ):

            strengths.append(
                "Soil potassium is within the screening range."
            )

        elif potassium < profile["potassium"]["min"]:

            warnings.append(
                "Soil potassium is below the preferred range."
            )

        else:

            warnings.append(
                "Soil potassium is above the configured screening range."
            )

    # ========================================================================
    # Moisture
    # ========================================================================

    moisture = get_soil_value(
        result,
        "moisture",
    )

    if moisture is not None:

        if (
            profile["moisture"]["min"]
            <= moisture
            <= profile["moisture"]["max"]
        ):

            strengths.append(
                "Soil moisture is within the screening range."
            )

        else:

            warnings.append(
                "Soil moisture is outside the preferred range."
            )

    # ========================================================================
    # Electrical Conductivity
    # ========================================================================

    ec = get_soil_value(
        result,
        "ec",
    )

    if ec is not None:

        if ec <= profile["ec_max"]:

            strengths.append(
                "Electrical conductivity is within the crop "
                "screening limit."
            )

        else:

            critical_constraints.append(
                "Electrical conductivity exceeds the screening "
                "limit for this crop."
            )

    return {
        "strengths": strengths,
        "warnings": warnings,
        "critical_constraints": critical_constraints,
    }


# ============================================================================
# SUITABILITY CLASSIFICATION
# ============================================================================

def classify_suitability(
    score,
    critical_constraints,
    warnings,
):
    """
    Convert score and crop-specific constraints into a
    provisional suitability category.
    """

    if critical_constraints:

        return "CRITICAL_CONSTRAINT"

    if score >= Decimal("80"):

        return "HIGHLY_SUITABLE"

    if score >= Decimal("65"):

        if warnings:
            return "CONDITIONAL"

        return "SUITABLE"

    if score >= Decimal("50"):

        return "MARGINAL"

    return "UNSUITABLE"


# ============================================================================
# DECISION
# ============================================================================

def determine_crop_decision(
    suitability,
):
    """
    Convert suitability into a crop-level decision.

    This decision does not yet account for global measurement
    validation. That happens in recommendations.py.
    """

    if suitability in (
        "HIGHLY_SUITABLE",
        "SUITABLE",
    ):

        return "RECOMMEND"

    if suitability == "CONDITIONAL":

        return "CONDITIONAL"

    if suitability == "MARGINAL":

        return "HOLD"

    return "DO_NOT_RECOMMEND"


# ============================================================================
# CONFIDENCE
# ============================================================================

def determine_confidence(
    suitability,
):
    """
    Determine provisional confidence.
    """

    if suitability == "HIGHLY_SUITABLE":

        return "HIGH"

    if suitability in (
        "SUITABLE",
        "CONDITIONAL",
    ):

        return "MODERATE"

    return "LOW"


# ============================================================================
# PUBLIC FUNCTION
# ============================================================================

def rank_crops_for_soil(result):
    """
    Rank all configured crops against a SoilTestResult.

    Returns:

        highest provisional score
        ->
        lowest provisional score

    IMPORTANT:

    The returned ranking is provisional.

    A CRITICAL measurement does not get hidden here.
    The recommendation engine applies the final safety gate.
    """

    ranked = []

    for crop_name, profile in CROP_PROFILES.items():

        raw_score = calculate_crop_score(
            result,
            profile,
        )

        score = raw_score.quantize(
            Decimal("0.01")
        )

        constraints = analyze_crop_constraints(
            result,
            crop_name,
            profile,
        )

        suitability = classify_suitability(
            score,
            constraints["critical_constraints"],
            constraints["warnings"],
        )

        decision = determine_crop_decision(
            suitability
        )

        confidence = determine_confidence(
            suitability
        )

        ranked.append(
            {
                "crop": crop_name,

                "score": score,

                "suitability": suitability,

                "critical_constraints": constraints[
                    "critical_constraints"
                ],

                "warnings": constraints[
                    "warnings"
                ],

                "strengths": constraints[
                    "strengths"
                ],

                "decision": decision,

                "confidence": confidence,
            }
        )

    ranked.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return ranked