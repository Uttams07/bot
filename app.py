"""from flask import Flask, render_template, request
import requests
from datetime import datetime

app = Flask(__name__)

# OpenWeather API Key (replace with your actual key)
API_KEY = "2b72a57efdce9f507d3bcee682fb3878"
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/onecall"

@app.route("/", methods=["GET", "POST"])
def index():
    weather = None
    forecast = []

    if request.method == "POST":
        city = request.form.get("city")
        if city:
            params = {"q": city, "appid": API_KEY, "units": "metric"}
            response = requests.get(BASE_URL, params=params)
            data = response.json()

            if data.get("cod") == 200:
                # Get basic weather info
                weather = {
                    "city": data["name"],
                    "temperature": data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "pressure": data["main"]["pressure"],
                    "wind_speed": data["wind"]["speed"],
                    "description": data["weather"][0]["description"],
                    "icon": data["weather"][0]["icon"]
                }

                # Get latitude & longitude for 7-day forecast
                lat = data["coord"]["lat"]
                lon = data["coord"]["lon"]

                # Fetch the 7-day forecast
                forecast_params = {"lat": lat, "lon": lon, "exclude": "current,minutely,hourly", "appid": API_KEY, "units": "metric"}
                forecast_response = requests.get(FORECAST_URL, params=forecast_params)
                forecast_data = forecast_response.json()

                # Ensure 'daily' data exists before accessing
                if "daily" in forecast_data:
                    for day in forecast_data["daily"]:
                        forecast.append({
                            "date": datetime.utcfromtimestamp(day["dt"]).strftime('%A, %d %B'),
                            "temp": day["temp"]["day"],
                            "humidity": day["humidity"],
                            "description": day["weather"][0]["description"],
                            "icon": day["weather"][0]["icon"]
                        })

            else:
                weather = {"error": "City not found"}

    return render_template("index.html", weather=weather, forecast=forecast)

if __name__ == "__main__":
    app.run(debug=True)"""


from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use your actual OpenWeatherMap API key here
API_KEY = "2b72a57efdce9f507d3bcee682fb3878"

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def home():
    """Render the main weather page"""
    return render_template('index.html')

@app.route('/get_weather', methods=['POST'])
def get_weather():
    """Endpoint to fetch weather data"""
    try:
        # Get and validate input
        data = request.get_json()
        if not data or 'city' not in data:
            return jsonify({"error": "Invalid request format"}), 400
            
        city = data['city'].strip()
        if not city:
            return jsonify({"error": "City name cannot be empty"}), 400
        
        # Fetch weather data
        current_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"
        
        # Get current weather
        current_response = requests.get(current_url, timeout=10)
        current_response.raise_for_status()
        current_data = current_response.json()
        
        # Get forecast
        forecast_response = requests.get(forecast_url, timeout=10)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()
        
        # Process current weather
        current_weather = {
            "temp": round(current_data['main']['temp']),
            "feels_like": round(current_data['main']['feels_like']),
            "humidity": current_data['main']['humidity'],
            "wind": round(current_data['wind']['speed'] * 3.6, 1),  # Convert to km/h
            "description": current_data['weather'][0]['description'].title(),
            "icon": current_data['weather'][0]['icon'],
            "sunrise": datetime.fromtimestamp(current_data['sys']['sunrise']).strftime('%H:%M'),
            "sunset": datetime.fromtimestamp(current_data['sys']['sunset']).strftime('%H:%M'),
            "city": city
        }
        
        # Process 5-day forecast (one entry per day)
        forecast_days = []
        days_added = set()
        
        for item in forecast_data['list']:
            date = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
            if date not in days_added and len(days_added) < 5:
                days_added.add(date)
                forecast_days.append({
                    "day": datetime.fromtimestamp(item['dt']).strftime('%A'),
                    "date": datetime.fromtimestamp(item['dt']).strftime('%b %d'),
                    "temp": round(item['main']['temp']),
                    "temp_min": round(item['main']['temp_min']),
                    "temp_max": round(item['main']['temp_max']),
                    "icon": item['weather'][0]['icon'],
                    "description": item['weather'][0]['description'].title()
                })
        
        return jsonify({
            "current": current_weather,
            "forecast": forecast_days
        })
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return jsonify({"error": "City not found"}), 404
        logger.error(f"API Error: {str(e)}")
        return jsonify({"error": "Weather service unavailable"}), 502
    except requests.exceptions.RequestException as e:
        logger.error(f"Network Error: {str(e)}")
        return jsonify({"error": "Failed to connect to weather service"}), 503
    except KeyError as e:
        logger.error(f"Data Error: Missing key {str(e)}")
        return jsonify({"error": "Invalid weather data received"}), 500
    except Exception as e:
        logger.error(f"Unexpected Error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)