from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.farms.models import Farm

from .services import get_weather_for_coordinates


class FarmWeatherView(APIView):
    """
    Return current weather and a 7-day forecast for a
    registered SoilGenie farm.

    The farm's saved GPS coordinates are used as the
    weather location.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, farm_id):

        try:
            farm = Farm.objects.get(
                id=farm_id,
                status="ACTIVE",
            )

        except Farm.DoesNotExist:
            return Response(
                {
                    "detail": "Farm not found."
                },
                status=404,
            )

        # ---------------------------------------------------------
        # Authorization
        # ---------------------------------------------------------
        #
        # ADMIN:
        #   Can view any farm.
        #
        # AGENT:
        #   Can view farms registered by the agent.
        #
        # FARMER:
        #   Can view farms belonging to that farmer.
        #
        # AGRONOMIST:
        #   Can view the farm for technical support.
        #

        role = getattr(
            request.user,
            "role",
            None,
        )

        if role == "AGENT":

            if farm.registered_by_id != request.user.id:
                return Response(
                    {
                        "detail": (
                            "You do not have permission "
                            "to view weather for this farm."
                        )
                    },
                    status=403,
                )

        elif role == "FARMER":

            farmer = getattr(
                request.user,
                "farmer_profile",
                None,
            )

            if farmer is None:
                return Response(
                    {
                        "detail": (
                            "Your account is not linked "
                            "to a farmer profile."
                        )
                    },
                    status=403,
                )

            if farm.farmer_id != farmer.id:
                return Response(
                    {
                        "detail": (
                            "You do not have permission "
                            "to view weather for this farm."
                        )
                    },
                    status=403,
                )

        elif role in ["ADMIN", "AGRONOMIST"]:
            pass

        else:
            return Response(
                {
                    "detail": "Weather access is not available for this account."
                },
                status=403,
            )

        # ---------------------------------------------------------
        # GPS validation
        # ---------------------------------------------------------

        if (
            farm.latitude is None
            or farm.longitude is None
        ):
            return Response(
                {
                    "detail": (
                        "This farm does not have valid GPS "
                        "coordinates. Capture the farm location "
                        "before requesting weather information."
                    )
                },
                status=400,
            )

        # ---------------------------------------------------------
        # Request weather
        # ---------------------------------------------------------

        try:

            weather = get_weather_for_coordinates(
                latitude=float(farm.latitude),
                longitude=float(farm.longitude),
            )

        except Exception as exc:

            print(
                "Weather service error:",
                exc,
            )

            return Response(
                {
                    "detail": (
                        "Unable to retrieve weather data "
                        "for this farm right now."
                    )
                },
                status=502,
            )

        # ---------------------------------------------------------
        # Agricultural context
        # ---------------------------------------------------------

        weather["farm"] = {
            "id": farm.id,
            "farm_id": farm.farm_id,
            "farm_name": farm.farm_name,
            "farm_size": str(
                farm.farm_size
            ),
            "primary_crop": farm.primary_crop,
            "farming_type": farm.farming_type,
            "irrigation_type": farm.irrigation_type,
            "state": farm.state,
            "lga": farm.lga,
            "ward": farm.ward,
            "village": farm.village,
            "latitude": str(
                farm.latitude
            ),
            "longitude": str(
                farm.longitude
            ),
            "gps_accuracy": (
                str(farm.gps_accuracy)
                if farm.gps_accuracy is not None
                else None
            ),
        }

        weather["agricultural_context"] = {
            "rain_fed": farm.irrigation_type
            == "RAIN_FED",

            "primary_crop": farm.primary_crop,

            "weather_role": (
                "Weather information is provided "
                "as agricultural decision support and "
                "should be considered alongside soil "
                "measurements, crop requirements, field "
                "conditions and appropriate agronomic advice."
            ),
        }

        return Response(weather)