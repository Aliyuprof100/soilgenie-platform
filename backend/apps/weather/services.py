import requests


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


def get_weather_for_coordinates(
    latitude: float,
    longitude: float,
):
    """
    Retrieve current weather and a 7-day agricultural forecast
    for the supplied coordinates.

    This service intentionally contains no farmer-specific logic.
    Farm-specific data is handled by the API view.
    """

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation,"
            "rain,"
            "weather_code,"
            "wind_speed_10m,"
            "wind_direction_10m,"
            "surface_pressure"
        ),

        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation_probability,"
            "precipitation,"
            "rain,"
            "soil_moisture_0_to_1cm,"
            "soil_moisture_1_to_3cm,"
            "soil_moisture_3_to_9cm,"
            "et0_fao_evapotranspiration"
        ),

        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "precipitation_sum,"
            "rain_sum,"
            "precipitation_probability_max,"
            "wind_speed_10m_max,"
            "et0_fao_evapotranspiration"
        ),

        "forecast_days": 7,

        "timezone": "auto",
    }

    response = requests.get(
        OPEN_METEO_URL,
        params=params,
        timeout=15,
    )

    response.raise_for_status()

    data = response.json()

    return format_weather_response(data)


def format_weather_response(data: dict):
    """
    Convert the Open-Meteo response into a stable SoilGenie
    response structure.
    """

    current = data.get("current", {})
    daily = data.get("daily", {})
    hourly = data.get("hourly", {})

    current_code = current.get("weather_code")

    current_weather = {
        "time": current.get("time"),
        "temperature": current.get("temperature_2m"),
        "apparent_temperature": current.get(
            "apparent_temperature"
        ),
        "humidity": current.get(
            "relative_humidity_2m"
        ),
        "precipitation": current.get(
            "precipitation"
        ),
        "rain": current.get("rain"),
        "weather_code": current_code,
        "condition": WEATHER_CODES.get(
            current_code,
            "Unknown",
        ),
        "wind_speed": current.get(
            "wind_speed_10m"
        ),
        "wind_direction": current.get(
            "wind_direction_10m"
        ),
        "surface_pressure": current.get(
            "surface_pressure"
        ),
    }

    forecast = []

    dates = daily.get("time", [])

    for index, date in enumerate(dates):

        weather_code = get_index_value(
            daily.get("weather_code"),
            index,
        )

        forecast.append(
            {
                "date": date,

                "weather_code": weather_code,

                "condition": WEATHER_CODES.get(
                    weather_code,
                    "Unknown",
                ),

                "temperature_max": get_index_value(
                    daily.get("temperature_2m_max"),
                    index,
                ),

                "temperature_min": get_index_value(
                    daily.get("temperature_2m_min"),
                    index,
                ),

                "precipitation": get_index_value(
                    daily.get("precipitation_sum"),
                    index,
                ),

                "rain": get_index_value(
                    daily.get("rain_sum"),
                    index,
                ),

                "precipitation_probability": get_index_value(
                    daily.get(
                        "precipitation_probability_max"
                    ),
                    index,
                ),

                "wind_speed_max": get_index_value(
                    daily.get("wind_speed_10m_max"),
                    index,
                ),

                "et0": get_index_value(
                    daily.get(
                        "et0_fao_evapotranspiration"
                    ),
                    index,
                ),
            }
        )

    return {
        "timezone": data.get("timezone"),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),

        "current": current_weather,

        "forecast": forecast,

        "hourly": {
            "time": hourly.get("time", []),
            "soil_moisture_0_to_1cm": hourly.get(
                "soil_moisture_0_to_1cm",
                [],
            ),
            "soil_moisture_1_to_3cm": hourly.get(
                "soil_moisture_1_to_3cm",
                [],
            ),
            "soil_moisture_3_to_9cm": hourly.get(
                "soil_moisture_3_to_9cm",
                [],
            ),
            "et0": hourly.get(
                "et0_fao_evapotranspiration",
                [],
            ),
        },
    }


def get_index_value(values, index):
    """
    Safely retrieve an indexed value from an API list.
    """

    if not values:
        return None

    if index >= len(values):
        return None

    return values[index]