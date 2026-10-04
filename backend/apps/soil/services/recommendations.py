from decimal import Decimal



from .measurement_validation import (

    validate_soil_measurements,

)



from .crop_suitability import (

    rank_crops_for_soil,

)





# ============================================================================

# SOILGENIE RECOMMENDATION ENGINE

# ============================================================================



"""

SoilGenie Recommendation Engine



Pipeline:



    SoilTestResult

          |

          v

    Measurement Validation

          |

          v

    Soil Condition Interpretation

          |

          v

    Provisional Crop Suitability

          |

          v

    Safety Gate

          |

          v

    Final Recommendation

          |

          v

    Farmer-Friendly Summary





IMPORTANT SAFETY PRINCIPLE

\--------------------------



A CRITICAL measurement does NOT erase the provisional crop ranking.



Instead:



    1. SoilGenie calculates the provisional ranking.

    2. SoilGenie identifies the measurement problem.

    3. SoilGenie blocks automatic recommendations.

    4. SoilGenie tells the farmer what needs verification.



This means the system can still explain:



    "Pearl Millet currently appears to have the strongest

     provisional fit."



without incorrectly telling the farmer:



    "Plant Pearl Millet."



when the measurement data may be unreliable.

"""





# ============================================================================

# SUMMARY HELPERS

# ============================================================================



def build_soil_conditions(result):

    """

    Build a farmer-readable summary of soil conditions.

    """



    strengths = []

    limitations = []

    risks = []

    actions = []



    ph = result.ph

    nitrogen = result.nitrogen_mg_kg

    phosphorus = result.phosphorus_mg_kg

    potassium = result.potassium_mg_kg

    moisture = result.moisture_percent

    organic_matter = result.organic_matter_percent

    ec = result.electrical_conductivity_ds_m



    # ========================================================================

    # pH

    # ========================================================================



    if ph is not None:



        ph_value = Decimal(str(ph))



        if ph_value < Decimal("5.5"):



            limitations.append(

                "The soil is strongly acidic."

            )



            risks.append(

                "Low soil pH may restrict nutrient availability "

                "and crop performance."

            )



            actions.append(

                "Confirm soil pH with a reliable laboratory test "

                "before making major soil amendments."

            )



        elif ph_value > Decimal("8.0"):



            limitations.append(

                "The soil is strongly alkaline."

            )



            risks.append(

                "High soil pH may reduce availability of some nutrients."

            )



            actions.append(

                "Confirm soil pH with a reliable laboratory test "

                "before making major soil amendments."

            )



        else:



            strengths.append(

                "Soil pH is within the general screening range."

            )



    # ========================================================================

    # Nitrogen

    # ========================================================================



    if nitrogen is not None:



        nitrogen_value = Decimal(

            str(nitrogen)

        )



        if nitrogen_value < Decimal("20"):



            limitations.append(

                "Soil nitrogen appears low."

            )



            risks.append(

                "Low nitrogen availability may limit vegetative growth "

                "and crop development."

            )



            actions.append(

                "Review nitrogen management according to the intended "

                "crop and verified soil-test results."

            )



        else:



            strengths.append(

                "Soil nitrogen meets the general screening minimum."

            )



    # ========================================================================

    # Phosphorus

    # ========================================================================



    if phosphorus is not None:



        phosphorus_value = Decimal(

            str(phosphorus)

        )



        if phosphorus_value >= Decimal("10"):



            strengths.append(

                "Soil phosphorus is within the screening range."

            )



        else:



            limitations.append(

                "Soil phosphorus appears low."

            )



            actions.append(

                "Review phosphorus management using verified soil-test "

                "results and crop requirements."

            )



    # ========================================================================

    # Potassium

    # ========================================================================



    if potassium is not None:



        potassium_value = Decimal(

            str(potassium)

        )



        if potassium_value >= Decimal("60"):



            strengths.append(

                "Soil potassium is within the screening range."

            )



        else:



            limitations.append(

                "Soil potassium appears low."

            )



            actions.append(

                "Review potassium management according to crop needs."

            )



    # ========================================================================

    # Moisture

    # ========================================================================



    if moisture is not None:



        moisture_value = Decimal(

            str(moisture)

        )



        if (

            Decimal("20")

            <= moisture_value

            <= Decimal("80")

        ):



            strengths.append(

                "Soil moisture is within the general screening range."

            )



        elif moisture_value < Decimal("20"):



            limitations.append(

                "Soil moisture is relatively low."

            )



            risks.append(

                "Low soil moisture may restrict seed germination "

                "and early crop establishment."

            )

            actions.append(
                "Improve soil moisture conditions before planting. "
                "Consider planting when adequate soil moisture is available "
                "and review appropriate water-management options for the farm."
            )



        else:



            limitations.append(

                "Soil moisture is relatively high."

            )



            risks.append(

                "Excessive soil moisture may reduce root aeration "

                "and affect crop establishment."

            )

            actions.append(
                "Review field drainage and avoid unnecessary irrigation "
                "until soil moisture conditions are suitable for crop establishment."
            )



    # ========================================================================

    # Organic Matter

    # ========================================================================



    if organic_matter is not None:



        organic_value = Decimal(

            str(organic_matter)

        )



        if organic_value >= Decimal("1"):



            strengths.append(

                "Soil organic matter meets the SoilGenie screening minimum."

            )



        else:



            limitations.append(

                "Soil organic matter appears low."

            )



            actions.append(

                "Consider locally appropriate practices that can improve "

                "soil organic matter over time."

            )



    # ========================================================================

    # Electrical Conductivity

    # ========================================================================



    if ec is not None:



        ec_value = Decimal(

            str(ec)

        )



        if ec_value > Decimal("16"):



            limitations.append(

                "Electrical conductivity is extremely high."

            )



            risks.append(

                "The measurement may indicate severe salinity or "

                "a potentially unreliable sensor reading."

            )



            actions.append(

                "Repeat the EC measurement and confirm it with a "

                "reliable laboratory or reference method before planting."

            )



        elif ec_value > Decimal("8"):



            limitations.append(

                "Electrical conductivity indicates a high salinity risk."

            )



            risks.append(

                "High soil salinity can severely restrict water uptake "

                "and crop establishment."

            )



            actions.append(

                "Confirm the electrical conductivity result with a "

                "reliable laboratory method before planting."

            )



        elif ec_value > Decimal("4"):



            limitations.append(

                "Electrical conductivity indicates a possible salinity risk."

            )



            risks.append(

                "Elevated soil salinity may reduce crop performance."

            )



            actions.append(

                "Confirm electrical conductivity before making major "

                "crop-management decisions."

            )



        else:



            strengths.append(

                "Electrical conductivity is within the general "

                "screening range."

            )



    return {

        "strengths": strengths,

        "limitations": limitations,

        "risks": risks,

        "actions": actions,

    }





# ============================================================================

# CROP RECOMMENDATION GROUPING

# ============================================================================



def build_crop_recommendations(

    ranked,

    validation,

):

    """

    Convert provisional crop results into final recommendation categories.



    IMPORTANT:



    A critical measurement blocks automatic recommendation globally.



    However, provisional scores are retained so the system can still

    explain which crops appear strongest once the measurement issue

    is resolved.

    """



    recommended = []

    conditional = []

    hold = []

    avoid = []



    measurement_blocked = (

        validation["recommendation_blocked"]

    )



    for item in ranked:



        crop_item = {

            "crop": item["crop"],

            "score": item["score"],

            "decision": item["decision"],

            "confidence": item["confidence"],

            "suitability": item["suitability"],

            "reason": None,

            "critical_constraints": list(

                item["critical_constraints"]

            ),

            "warnings": list(

                item["warnings"]

            ),

            "strengths": list(

                item["strengths"]

            ),

            "automatic_recommendation": False,

            "provisional": False,

        }



        # ====================================================================

        # GLOBAL SAFETY BLOCK

        # ====================================================================



        if measurement_blocked:



            crop_item["provisional"] = True



            crop_item["automatic_recommendation"] = False



            crop_item["decision"] = "VERIFY_MEASUREMENTS"



            crop_item["confidence"] = "LOW"



            crop_item["reason"] = (

                "This crop has a provisional suitability score, but "

                "SoilGenie cannot automatically recommend it because "

                "one or more soil measurements require verification."

            )



            crop_item["critical_constraints"].append(

                "Automatic recommendation blocked by measurement-quality "

                "validation."

            )



            # Keep the crop in its provisional category based on

            # the original suitability.



            if item["suitability"] in (

                "HIGHLY_SUITABLE",

                "SUITABLE",

            ):



                conditional.append(

                    crop_item

                )



            elif item["suitability"] == "CONDITIONAL":



                conditional.append(

                    crop_item

                )



            elif item["suitability"] == "MARGINAL":



                hold.append(

                    crop_item

                )



            else:



                avoid.append(

                    crop_item

                )



            continue



        # ====================================================================

        # SAFE RECOMMENDATION PATH

        # ====================================================================



        if item["decision"] == "RECOMMEND":



            crop_item["reason"] = (

                "This crop has a strong overall soil suitability score "

                "and no critical crop-specific constraint was detected."

            )



            crop_item["automatic_recommendation"] = True



            recommended.append(

                crop_item

            )



        elif item["decision"] == "CONDITIONAL":



            crop_item["reason"] = (

                "This crop may be possible, but one or more soil "

                "limitations should be addressed or confirmed first."

            )



            conditional.append(

                crop_item

            )



        elif item["decision"] == "HOLD":



            crop_item["reason"] = (

                "The current soil conditions are marginal for this crop. "

                "Additional verification or soil improvement may be required."

            )



            hold.append(

                crop_item

            )



        else:



            crop_item["reason"] = (

                "A critical soil constraint currently makes this crop "

                "unsuitable for automatic recommendation."

            )



            avoid.append(

                crop_item

            )



    return {

        "recommended": recommended,

        "conditional": conditional,

        "hold": hold,

        "avoid": avoid,

    }





# ============================================================================

# BEST CROP

# ============================================================================



def select_best_crop(

    crop_recommendations,

    validation,

):

    """

    Select the highest-ranked crop only when automatic recommendations

    are allowed.



    If measurements are blocked or incomplete, return None.



    This is deliberate: a provisional winner must not be presented

    as a safe planting recommendation.

    """



    if validation["recommendation_blocked"]:



        return None



    recommended = crop_recommendations[

        "recommended"

    ]



    if recommended:



        return recommended[0]["crop"]



    return None





# ============================================================================

# PROVISIONAL BEST CROP

# ============================================================================



def select_provisional_best_crop(

    ranked,

):

    """

    Return the highest-ranked crop from the provisional ranking.



    This is informational only.



    It must never be presented as an automatic recommendation when

    measurement validation has blocked recommendations.

    """



    if not ranked:



        return None



    return ranked[0]["crop"]





# ============================================================================

# FARMER SUMMARY

# ============================================================================



def build_farmer_summary(

    validation,

    soil_conditions,

    crop_recommendations,

    best_crop,

    provisional_best_crop,

):

    """

    Build a farmer-friendly explanation.

    """



    messages = []



    # ========================================================================

    # Measurement quality

    # ========================================================================



    if validation["overall_status"] == "CRITICAL":



        messages.append(

            "Some soil measurements failed the configured "

            "measurement-quality checks."

        )



        messages.append(

            "Automatic crop recommendations have therefore been "

            "blocked until the affected measurements are verified."

        )



    elif validation["overall_status"] == "WARNING":



        messages.append(

            "Some soil measurements require confirmation before "

            "making important crop-management decisions."

        )



    elif validation["overall_status"] == "INCOMPLETE":



        messages.append(

            "Some soil measurements are missing, so crop suitability "

            "cannot be assessed with full confidence."

        )



    else:



        messages.append(

            "The available soil measurements passed the basic "

            "data-quality screening."

        )



    # ========================================================================

    # Critical measurement details

    # ========================================================================



    if validation["critical_measurements"]:



        critical_names = []



        for measurement in validation[

            "critical_measurements"

        ]:



            critical_names.append(

                measurement["parameter"]

            )



        messages.append(

            "Measurements requiring urgent verification include: "

            + ", ".join(critical_names)

            + "."

        )



    # ========================================================================

    # Provisional best crop

    # ========================================================================



    if validation["recommendation_blocked"]:



        if provisional_best_crop:



            messages.append(

                f"{provisional_best_crop} currently has the strongest "

                "provisional suitability score among the crops assessed, "

                "but this is not a planting recommendation."

            )



        messages.append(

            "The provisional ranking should only be used to guide "

            "further verification and agronomic review."

        )



    elif best_crop:



        messages.append(

            f"Based on the available measurements, {best_crop} "

            "currently has the strongest suitability score among "

            "the crops assessed."

        )



    else:



        messages.append(

            "SoilGenie could not identify a crop that is currently "

            "safe to recommend with sufficient confidence."

        )



    # ========================================================================

    # Soil limitations

    # ========================================================================



    if soil_conditions["limitations"]:



        messages.append(

            "The main soil limitations are: "

            + " ".join(

                soil_conditions["limitations"]

            )

        )



    # ========================================================================

    # Risks

    # ========================================================================



    if soil_conditions["risks"]:



        messages.append(

            "Important risks include: "

            + " ".join(

                soil_conditions["risks"]

            )

        )



    # ========================================================================

    # Actions

    # ========================================================================



    if soil_conditions["actions"]:



        messages.append(

            "Recommended next steps: "

            + " ".join(

                soil_conditions["actions"]

            )

        )



    return " ".join(messages)





# ============================================================================

# PUBLIC FUNCTION

# ============================================================================



def generate_recommendations(result):

    """

    Main SoilGenie recommendation pipeline.



    Returns:



        measurement_validation

        soil_conditions

        provisional_crop_ranking

        crop_recommendations

        best_crop

        provisional_best_crop

        farmer_summary

    """



    # ========================================================================

    # STEP 1

    # Measurement validation

    # ========================================================================



    validation = validate_soil_measurements(

        result

    )



    # ========================================================================

    # STEP 2

    # Soil condition interpretation

    # ========================================================================



    soil_conditions = build_soil_conditions(

        result

    )



    # ========================================================================

    # STEP 3

    # Provisional crop ranking

    # ========================================================================



    ranked = rank_crops_for_soil(

        result

    )



    provisional_best_crop = (

        select_provisional_best_crop(

            ranked

        )

    )



    # ========================================================================

    # STEP 4

    # Final recommendation safety gate

    # ========================================================================



    crop_recommendations = (

        build_crop_recommendations(

            ranked=ranked,

            validation=validation,

        )

    )



    # ========================================================================

    # STEP 5

    # Best safe crop

    # ========================================================================



    best_crop = select_best_crop(

        crop_recommendations=crop_recommendations,

        validation=validation,

    )



    # ========================================================================

    # STEP 6

    # Farmer summary

    # ========================================================================



    farmer_summary = build_farmer_summary(

        validation=validation,

        soil_conditions=soil_conditions,

        crop_recommendations=crop_recommendations,

        best_crop=best_crop,

        provisional_best_crop=provisional_best_crop,

    )



    # ========================================================================

    # STEP 7

    # Final response

    # ========================================================================



    return {

        "measurement_validation": validation,



        "soil_conditions": soil_conditions,



        "provisional_crop_ranking": ranked,



        "crop_recommendations": crop_recommendations,



        "best_crop": best_crop,



        "provisional_best_crop": provisional_best_crop,



        "farmer_summary": farmer_summary,

    }