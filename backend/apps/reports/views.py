from io import BytesIO
from html import escape

from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from apps.soil.models import SoilTest
from apps.soil.services.recommendations import (
    generate_recommendations,
)


# ============================================================================
# SOILGENIE BRAND COLORS
# ============================================================================

GREEN = colors.HexColor("#15803D")
DARK_GREEN = colors.HexColor("#166534")
LIGHT_GREEN = colors.HexColor("#DCFCE7")
VERY_LIGHT_GREEN = colors.HexColor("#F0FDF4")

DARK = colors.HexColor("#0F172A")
SLATE = colors.HexColor("#475569")
LIGHT_SLATE = colors.HexColor("#64748B")

BORDER = colors.HexColor("#CBD5E1")
LIGHT_BG = colors.HexColor("#F8FAFC")
WHITE = colors.white

WARNING = colors.HexColor("#B45309")
WARNING_BG = colors.HexColor("#FEF3C7")

GOOD = colors.HexColor("#15803D")
GOOD_BG = colors.HexColor("#DCFCE7")

DANGER = colors.HexColor("#B91C1C")
DANGER_BG = colors.HexColor("#FEE2E2")


# ============================================================================
# HELPERS
# ============================================================================

def safe_text(value, default="—"):
    """
    Convert a value safely into printable text.
    """
    if value is None or value == "":
        return default

    return escape(str(value))


def format_decimal(value, decimals=2):
    """
    Format numeric values cleanly.
    """
    if value is None:
        return "—"

    try:
        return f"{float(value):.{decimals}f}"
    except (TypeError, ValueError):
        return safe_text(value)


def human_status(status):
    """
    Convert internal statuses such as HIGHLY_SUITABLE
    into readable text.
    """
    if not status:
        return "—"

    return str(status).replace("_", " ").title()


def status_color(status):
    """
    Return a display colour based on the status.
    """
    value = str(status or "").upper()

    if value in {
        "GOOD",
        "OPTIMAL",
        "ADEQUATE",
        "VALID",
        "HIGHLY_SUITABLE",
        "RECOMMEND",
    }:
        return GOOD

    if value in {
        "LOW",
        "WARNING",
        "CAUTION",
        "MODERATE",
    }:
        return WARNING

    if value in {
        "CRITICAL",
        "INVALID",
        "AVOID",
        "HOLD",
    }:
        return DANGER

    return SLATE


def build_clean_location(farm):
    """
    Build a clean farmer-friendly location string.

    Removes duplicate consecutive or repeated location values.
    Example:

        Daniski, Daniski, Nangere, Yobe

    becomes:

        Daniski, Nangere, Yobe
    """

    raw_parts = [
        getattr(farm, "village", None),
        getattr(farm, "ward", None),
        getattr(farm, "lga", None),
        getattr(farm, "state", None),
    ]

    cleaned = []

    for part in raw_parts:

        if not part:
            continue

        value = str(part).strip()

        if not value:
            continue

        already_exists = any(
            existing.lower() == value.lower()
            for existing in cleaned
        )

        if not already_exists:
            cleaned.append(value)

    return ", ".join(cleaned) if cleaned else "—"


# ============================================================================
# SOIL REPORT PDF VIEW
# ============================================================================

class SoilReportPDFView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request, test_id):

        # ====================================================================
        # LOAD SOIL TEST
        # ====================================================================

        soil_test = get_object_or_404(
            SoilTest.objects.select_related(
                "sample",
                "sample__farm",
                "sample__farm__farmer",
            ),
            id=test_id,
        )

        farm = soil_test.sample.farm
        farmer = farm.farmer

        # ====================================================================
        # SOIL RESULT
        # ====================================================================

        result = None

        if hasattr(soil_test, "result"):
            result = soil_test.result

        # ====================================================================
        # SOIL ANALYSIS
        # ====================================================================

        analysis = None

        try:
            analysis = soil_test.analysis
        except Exception:
            analysis = None

        # ====================================================================
        # RECOMMENDATIONS
        # ====================================================================

        recommendation = {}

        if result:

            try:
                recommendation = generate_recommendations(
                    result
                )
            except Exception:
                recommendation = {}

        # ====================================================================
        # RECOMMENDATION DATA
        # ====================================================================

        farmer_summary = recommendation.get(
            "farmer_summary",
            "",
        )

        best_crop = recommendation.get(
            "best_crop"
        )

        crop_recommendations = recommendation.get(
            "crop_recommendations",
            {},
        )

        recommended_crops = (
            crop_recommendations.get(
                "recommended",
                [],
            )
            if isinstance(crop_recommendations, dict)
            else []
        )

        soil_conditions = recommendation.get(
            "soil_conditions",
            {},
        )

        if not isinstance(soil_conditions, dict):
            soil_conditions = {}

        limitations = soil_conditions.get(
            "limitations",
            [],
        )

        actions = soil_conditions.get(
            "actions",
            [],
        )

        # ====================================================================
        # OVERALL STATUS
        # ====================================================================

        overall_status = (
            getattr(
                analysis,
                "overall_status",
                None,
            )
            if analysis
            else None
        )

        overall_status = (
            overall_status or "GOOD"
        )

        # ====================================================================
        # REPORT IDENTIFIERS
        # ====================================================================

        report_id = str(
            getattr(
                soil_test,
                "test_id",
                None,
            )
            or getattr(
                soil_test,
                "id",
                test_id,
            )
        )

        report_date = (
            soil_test.created_at.strftime(
                "%d %B %Y"
            )
            if soil_test.created_at
            else "—"
        )

        generated_at = (
            soil_test.updated_at.strftime(
                "%d %B %Y, %H:%M"
            )
            if getattr(
                soil_test,
                "updated_at",
                None,
            )
            else report_date
        )

        farmer_name = (
            f"{farmer.first_name} "
            f"{farmer.last_name}"
        )

        location = build_clean_location(
            farm
        )

        # ====================================================================
        # CREATE PDF
        # ====================================================================

        buffer = BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=14 * mm,
            leftMargin=14 * mm,
            topMargin=13 * mm,
            bottomMargin=14 * mm,
            title="SoilGenie Soil Health Report",
            author="SoilGenie",
        )

        styles = getSampleStyleSheet()

        # ====================================================================
        # STYLES
        # ====================================================================

        brand_style = ParagraphStyle(
            "Brand",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=22,
            textColor=GREEN,
            alignment=TA_CENTER,
            spaceAfter=2,
        )

        report_title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            textColor=DARK,
            alignment=TA_CENTER,
            spaceAfter=3,
        )

        tagline_style = ParagraphStyle(
            "Tagline",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=SLATE,
            alignment=TA_CENTER,
        )

        section_style = ParagraphStyle(
            "Section",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=13,
            textColor=DARK_GREEN,
            spaceBefore=3,
            spaceAfter=6,
        )

        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=10.5,
            textColor=DARK,
        )

        small_style = ParagraphStyle(
            "Small",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7,
            leading=9,
            textColor=SLATE,
        )

        small_bold_style = ParagraphStyle(
            "SmallBold",
            parent=small_style,
            fontName="Helvetica-Bold",
            textColor=DARK,
        )

        status_style = ParagraphStyle(
            "Status",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            textColor=GOOD,
            alignment=TA_CENTER,
        )

        crop_name_style = ParagraphStyle(
            "CropName",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=16,
            textColor=DARK_GREEN,
            alignment=TA_CENTER,
        )

        crop_score_style = ParagraphStyle(
            "CropScore",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=18,
            textColor=GREEN,
            alignment=TA_CENTER,
        )

        footer_style = ParagraphStyle(
            "Footer",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=6.5,
            leading=8,
            textColor=LIGHT_SLATE,
            alignment=TA_CENTER,
        )

        # ====================================================================
        # CONTENT
        # ====================================================================

        content = []

        # ====================================================================
        # HEADER
        # ====================================================================

        content.append(
            Paragraph(
                "SoilGenie",
                brand_style,
            )
        )

        content.append(
            Paragraph(
                "SOIL HEALTH REPORT",
                report_title_style,
            )
        )

        content.append(
            Paragraph(
                "Better Soil. Better Decisions.",
                tagline_style,
            )
        )

        content.append(
            Spacer(1, 8),
        )

        # ====================================================================
        # FARMER INFORMATION
        # ====================================================================

        farmer_information = Table(
            [
                [
                    Paragraph(
                        "<b>Farmer</b>",
                        small_style,
                    ),
                    Paragraph(
                        safe_text(
                            farmer_name
                        ),
                        body_style,
                    ),
                    Paragraph(
                        "<b>Farm</b>",
                        small_style,
                    ),
                    Paragraph(
                        safe_text(
                            farm.farm_name
                        ),
                        body_style,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Farm ID</b>",
                        small_style,
                    ),
                    Paragraph(
                        safe_text(
                            farm.farm_id
                        ),
                        body_style,
                    ),
                    Paragraph(
                        "<b>Sample ID</b>",
                        small_style,
                    ),
                    Paragraph(
                        safe_text(
                            soil_test.sample.sample_id
                        ),
                        body_style,
                    ),
                ],
                [
                    Paragraph(
                        "<b>Report Date</b>",
                        small_style,
                    ),
                    Paragraph(
                        safe_text(
                            report_date
                        ),
                        body_style,
                    ),
                    Paragraph(
                        "<b>Location</b>",
                        small_style,
                    ),
                    Paragraph(
                        safe_text(
                            location
                        ),
                        body_style,
                    ),
                ],
            ],
            colWidths=[
                24 * mm,
                62 * mm,
                24 * mm,
                62 * mm,
            ],
        )

        farmer_information.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        LIGHT_BG,
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.6,
                        BORDER,
                    ),
                    (
                        "INNERGRID",
                        (0, 0),
                        (-1, -1),
                        0.35,
                        BORDER,
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                ]
            )
        )

        content.append(
            farmer_information
        )

        content.append(
            Spacer(1, 9),
        )

        # ====================================================================
        # CONDITION + BEST CROP
        # ====================================================================

        best_crop_data = None

        if recommended_crops:
            best_crop_data = recommended_crops[0]

        if not best_crop_data and best_crop:

            best_crop_data = {
                "crop": best_crop,
                "score": "",
                "suitability": "RECOMMEND",
                "confidence": "",
            }

        best_crop_name = (
            best_crop_data.get("crop")
            if best_crop_data
            else "Not available"
        )

        best_crop_score = (
            best_crop_data.get("score")
            if best_crop_data
            else None
        )

        best_crop_suitability = (
            best_crop_data.get(
                "suitability"
            )
            if best_crop_data
            else None
        )

        best_crop_confidence = (
            best_crop_data.get(
                "confidence"
            )
            if best_crop_data
            else None
        )

        condition_text = (
            farmer_summary
            or (
                "The available soil measurements "
                "have been assessed by SoilGenie."
            )
        )

        condition_cell = Table(
            [
                [
                    Paragraph(
                        "YOUR SOIL CONDITION",
                        small_bold_style,
                    )
                ],
                [
                    Paragraph(
                        human_status(
                            overall_status
                        ),
                        status_style,
                    )
                ],
                [
                    Paragraph(
                        safe_text(
                            condition_text
                        ),
                        small_style,
                    )
                ],
            ],
            colWidths=[
                88 * mm
            ],
        )

        condition_cell.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        VERY_LIGHT_GREEN,
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.8,
                        GREEN,
                    ),
                    (
                        "ALIGN",
                        (0, 0),
                        (-1, -1),
                        "CENTER",
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                ]
            )
        )

        crop_cell = Table(
            [
                [
                    Paragraph(
                        "BEST CROP MATCH",
                        small_bold_style,
                    )
                ],
                [
                    Paragraph(
                        safe_text(
                            best_crop_name
                        ),
                        crop_name_style,
                    )
                ],
                [
                    Paragraph(
                        (
                            f"{format_decimal(best_crop_score)} / 100"
                            if best_crop_score is not None
                            else "—"
                        ),
                        crop_score_style,
                    )
                ],
                [
                    Paragraph(
                        human_status(
                            best_crop_suitability
                        ),
                        small_bold_style,
                    )
                ],
                [
                    Paragraph(
                        (
                            f"Confidence: "
                            f"{human_status(best_crop_confidence)}"
                            if best_crop_confidence
                            else ""
                        ),
                        small_style,
                    )
                ],
            ],
            colWidths=[
                88 * mm
            ],
        )

        crop_cell.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        LIGHT_GREEN,
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.8,
                        GREEN,
                    ),
                    (
                        "ALIGN",
                        (0, 0),
                        (-1, -1),
                        "CENTER",
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                ]
            )
        )

        summary_row = Table(
            [
                [
                    condition_cell,
                    crop_cell,
                ]
            ],
            colWidths=[
                91 * mm,
                91 * mm,
            ],
        )

        summary_row.setStyle(
            TableStyle(
                [
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                ]
            )
        )

        content.append(
            summary_row
        )

        content.append(
            Spacer(1, 9),
        )

        # ====================================================================
        # SOIL HEALTH SNAPSHOT
        # ====================================================================

        content.append(
            Paragraph(
                "Soil Health Snapshot",
                section_style,
            )
        )

        measurement_items = []

        if result:

            measurement_items = [
                (
                    "pH",
                    format_decimal(
                        result.ph
                    ),
                    getattr(
                        analysis,
                        "ph_status",
                        "—",
                    )
                    if analysis
                    else "—",
                ),
                (
                    "Nitrogen",
                    f"{format_decimal(result.nitrogen_mg_kg)} mg/kg",
                    getattr(
                        analysis,
                        "nitrogen_status",
                        "—",
                    )
                    if analysis
                    else "—",
                ),
                (
                    "Phosphorus",
                    f"{format_decimal(result.phosphorus_mg_kg)} mg/kg",
                    getattr(
                        analysis,
                        "phosphorus_status",
                        "—",
                    )
                    if analysis
                    else "—",
                ),
                (
                    "Potassium",
                    f"{format_decimal(result.potassium_mg_kg)} mg/kg",
                    getattr(
                        analysis,
                        "potassium_status",
                        "—",
                    )
                    if analysis
                    else "—",
                ),
                (
                    "Moisture",
                    f"{format_decimal(result.moisture_percent)}%",
                    getattr(
                        analysis,
                        "moisture_status",
                        "—",
                    )
                    if analysis
                    else "—",
                ),
                (
                    "Organic Matter",
                    f"{format_decimal(result.organic_matter_percent)}%",
                    getattr(
                        analysis,
                        "organic_matter_status",
                        "—",
                    )
                    if analysis
                    else "—",
                ),
                (
                    "EC",
                    f"{format_decimal(result.electrical_conductivity_ds_m, 4)} dS/m",
                    "—",
                ),
                (
                    "Temperature",
                    f"{format_decimal(result.temperature_celsius)} °C",
                    "—",
                ),
            ]

        measurement_rows = []

        for index in range(
            0,
            len(measurement_items),
            4,
        ):

            group = measurement_items[
                index:index + 4
            ]

            cells = []

            for parameter, value, status in group:

                metric_value_style = ParagraphStyle(
                    "MetricValue",
                    parent=body_style,
                    fontName="Helvetica-Bold",
                    fontSize=11,
                    leading=13,
                    textColor=DARK,
                )

                metric_status_style = ParagraphStyle(
                    "MetricStatus",
                    parent=small_style,
                    fontName="Helvetica-Bold",
                    textColor=status_color(
                        status
                    ),
                )

                cell = Table(
                    [
                        [
                            Paragraph(
                                safe_text(
                                    parameter
                                ),
                                small_style,
                            )
                        ],
                        [
                            Paragraph(
                                safe_text(
                                    value
                                ),
                                metric_value_style,
                            )
                        ],
                        [
                            Paragraph(
                                human_status(
                                    status
                                ),
                                metric_status_style,
                            )
                        ],
                    ],
                    colWidths=[
                        43 * mm
                    ],
                )

                cell.setStyle(
                    TableStyle(
                        [
                            (
                                "BACKGROUND",
                                (0, 0),
                                (-1, -1),
                                WHITE,
                            ),
                            (
                                "BOX",
                                (0, 0),
                                (-1, -1),
                                0.6,
                                BORDER,
                            ),
                            (
                                "LEFTPADDING",
                                (0, 0),
                                (-1, -1),
                                6,
                            ),
                            (
                                "RIGHTPADDING",
                                (0, 0),
                                (-1, -1),
                                6,
                            ),
                            (
                                "TOPPADDING",
                                (0, 0),
                                (-1, -1),
                                4,
                            ),
                            (
                                "BOTTOMPADDING",
                                (0, 0),
                                (-1, -1),
                                4,
                            ),
                        ]
                    )
                )

                cells.append(cell)

            while len(cells) < 4:

                cells.append(
                    Table(
                        [[""]],
                        colWidths=[
                            43 * mm
                        ],
                    )
                )

            measurement_rows.append(
                cells
            )

        if measurement_rows:

            measurement_table = Table(
                measurement_rows,
                colWidths=[
                    44 * mm,
                    44 * mm,
                    44 * mm,
                    44 * mm,
                ],
            )

            measurement_table.setStyle(
                TableStyle(
                    [
                        (
                            "VALIGN",
                            (0, 0),
                            (-1, -1),
                            "TOP",
                        ),
                        (
                            "LEFTPADDING",
                            (0, 0),
                            (-1, -1),
                            0,
                        ),
                        (
                            "RIGHTPADDING",
                            (0, 0),
                            (-1, -1),
                            3,
                        ),
                        (
                            "TOPPADDING",
                            (0, 0),
                            (-1, -1),
                            0,
                        ),
                        (
                            "BOTTOMPADDING",
                            (0, 0),
                            (-1, -1),
                            4,
                        ),
                    ]
                )
            )

            content.append(
                measurement_table
            )

        else:

            content.append(
                Paragraph(
                    "No verified soil measurements are available.",
                    body_style,
                )
            )

        content.append(
            Spacer(1, 7),
        )

        # ====================================================================
        # OTHER CROP MATCHES
        # ====================================================================

        content.append(
            Paragraph(
                "Other Suitable Crops",
                section_style,
            )
        )

        crop_rows = [
            [
                Paragraph(
                    "<b>Crop</b>",
                    small_style,
                ),
                Paragraph(
                    "<b>Score</b>",
                    small_style,
                ),
                Paragraph(
                    "<b>Suitability</b>",
                    small_style,
                ),
                Paragraph(
                    "<b>Confidence</b>",
                    small_style,
                ),
            ]
        ]

        for crop in recommended_crops[:6]:

            crop_name = crop.get(
                "crop",
                "—",
            )

            if (
                best_crop_name
                and str(crop_name).lower()
                == str(best_crop_name).lower()
            ):
                continue

            crop_rows.append(
                [
                    Paragraph(
                        safe_text(
                            crop_name
                        ),
                        body_style,
                    ),
                    Paragraph(
                        format_decimal(
                            crop.get(
                                "score"
                            )
                        ),
                        body_style,
                    ),
                    Paragraph(
                        human_status(
                            crop.get(
                                "suitability"
                            )
                        ),
                        body_style,
                    ),
                    Paragraph(
                        human_status(
                            crop.get(
                                "confidence"
                            )
                        ),
                        body_style,
                    ),
                ]
            )

        if len(crop_rows) == 1:

            crop_rows.append(
                [
                    Paragraph(
                        "No additional crop recommendations.",
                        small_style,
                    ),
                    "",
                    "",
                    "",
                ]
            )

        other_crop_table = Table(
            crop_rows,
            colWidths=[
                62 * mm,
                28 * mm,
                48 * mm,
                40 * mm,
            ],
            repeatRows=1,
        )

        other_crop_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        LIGHT_GREEN,
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        DARK_GREEN,
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.6,
                        BORDER,
                    ),
                    (
                        "INNERGRID",
                        (0, 0),
                        (-1, -1),
                        0.35,
                        BORDER,
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                ]
            )
        )

        content.append(
            other_crop_table
        )

        content.append(
            Spacer(1, 7),
        )

        # ====================================================================
        # ACTION PLAN
        # ====================================================================

        content.append(
            Paragraph(
                "What Should I Do Next?",
                section_style,
            )
        )

        action_items = []

        if actions:

            action_items = actions[:3]

        elif limitations:

            action_items = [
                f"Review: {item}"
                for item in limitations[:3]
            ]

        if not action_items:

            action_items = [
                "Continue monitoring soil and field conditions.",
                "Use crop-specific agronomic guidance when making input decisions.",
            ]

        action_rows = []

        for index, action in enumerate(
            action_items,
            start=1,
        ):

            action_rows.append(
                [
                    Paragraph(
                        f"<b>{index}</b>",
                        ParagraphStyle(
                            "ActionNumber",
                            parent=body_style,
                            fontName="Helvetica-Bold",
                            fontSize=10,
                            textColor=GREEN,
                            alignment=TA_CENTER,
                        ),
                    ),
                    Paragraph(
                        safe_text(
                            action
                        ),
                        body_style,
                    ),
                ]
            )

        action_table = Table(
            action_rows,
            colWidths=[
                12 * mm,
                166 * mm,
            ],
        )

        action_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (0, -1),
                        LIGHT_GREEN,
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.6,
                        BORDER,
                    ),
                    (
                        "INNERGRID",
                        (0, 0),
                        (-1, -1),
                        0.35,
                        BORDER,
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        4,
                    ),
                ]
            )
        )

        content.append(
            action_table
        )

        content.append(
            Spacer(1, 6),
        )

        # ====================================================================
        # IMPORTANT NOTICE
        # ====================================================================

        disclaimer = (
            "This report provides agricultural decision-support "
            "based on the available soil measurements. Crop "
            "suitability and management guidance should be "
            "considered alongside local weather, planting season, "
            "crop variety, field conditions and appropriate "
            "agronomic advice."
        )

        disclaimer_table = Table(
            [
                [
                    Paragraph(
                        "<b>Important:</b> "
                        + safe_text(
                            disclaimer
                        ),
                        small_style,
                    )
                ]
            ],
            colWidths=[
                178 * mm
            ],
        )

        disclaimer_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        LIGHT_BG,
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        BORDER,
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        7,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        7,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                ]
            )
        )

        content.append(
            disclaimer_table
        )

        content.append(
            Spacer(1, 4),
        )

        # ====================================================================
        # REPORT METADATA
        # ====================================================================

        metadata_table = Table(
            [
                [
                    Paragraph(
                        f"<b>Report ID:</b> "
                        f"{safe_text(report_id)}",
                        footer_style,
                    ),
                    Paragraph(
                        f"<b>Generated:</b> "
                        f"{safe_text(generated_at)}",
                        footer_style,
                    ),
                ]
            ],
            colWidths=[
                89 * mm,
                89 * mm,
            ],
        )

        metadata_table.setStyle(
            TableStyle(
                [
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "ALIGN",
                        (0, 0),
                        (0, 0),
                        "LEFT",
                    ),
                    (
                        "ALIGN",
                        (1, 0),
                        (1, 0),
                        "RIGHT",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        0,
                    ),
                ]
            )
        )

        content.append(
            metadata_table
        )

        content.append(
            Spacer(1, 3),
        )

        # ====================================================================
        # FOOTER
        # ====================================================================

        content.append(
            Paragraph(
                "SoilGenie | Better Soil. Better Decisions. | "
                "AI Precision Agriculture",
                footer_style,
            )
        )

        # ====================================================================
        # BUILD PDF
        # ====================================================================

        document.build(
            content
        )

        pdf = buffer.getvalue()

        buffer.close()

        # ====================================================================
        # RESPONSE
        # ====================================================================

        response = HttpResponse(
            pdf,
            content_type="application/pdf",
        )

        response[
            "Content-Disposition"
        ] = (
            f'attachment; filename="'
            f'SoilGenie-'
            f'{soil_test.sample.sample_id}.pdf"'
        )

        return response