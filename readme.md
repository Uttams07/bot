# 🌦️ Weather Forecast Application

A responsive weather application that shows current conditions and 5-day forecast using OpenWeatherMap API.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [VS Code Setup](#vs-code-setup)
3. [Terminal Commands](#terminal-commands)
4. [Project Setup](#project-setup)
5. [File Structure](#file-structure)
6. [Installation](#installation)
7. [Configuration](#configuration)
8. [Running the App](#running-the-app)
9. [Features](#features)
10. [Troubleshooting](#troubleshooting)
11. [License](#license)

## Prerequisites
- **Python 3.7+** - [Download Python](https://www.python.org/downloads/)
- **Code Editor** - [VS Code](https://code.visualstudio.com/) recommended
- **OpenWeatherMap API Key** - [Get Free API Key](https://openweathermap.org/api)

## VS Code Setup
1. Install these extensions:
   - Python
   - Pylance
   - ESLint
2. Open integrated terminal (Ctrl+`)

## Terminal Commands
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows):
.\venv\Scripts\activate

# Install packages
pip install flask requests

mkdir weather-app
cd weather-app
mkdir static templates
touch app.py static/style.css static/app.js templates/index.html

## File Structure

```

```
weather-app/
├── app.py              # Backend Flask server
├── static/
│   ├── style.css      # Styling for the app
│   └── app.js         # Frontend JavaScript
├── templates/
│   └── index.html     # Main HTML page
└── README.md          # Documentation
```

## Installation


# Install required packages
pip install flask requests

# Verify installations
python --version

pip show flask requests


## Configuration

1. Add your OpenWeatherMap API key to `app.py`:
```python
API_KEY = "your_api_key_here"  # Replace with actual key
```

2. Ensure all files are in correct locations as per file structure

## Running the App

```bash
# Start development server
python app.py

# Expected output:
# * Serving Flask app 'app'
# * Debug mode: on
# * Running on http://127.0.0.1:5000
```

Access the app at: http://localhost:5000

## Usage

1. **Search Weather**:
   - Type city name (e.g., "London", "Tokyo")
   - Press Enter or click search button

2. **View Weather Data**:
   - Current temperature and conditions
   - 5-day forecast with min/max temps
   - Sunrise/sunset times
   - Wind speed and humidity

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| API Key Not Working | Verify key at OpenWeatherMap dashboard |
| App Not Loading | Check file locations and Flask server status |
| 404 Not Found | Verify city name spelling |
| 500 Server Error | Check terminal for detailed error message |

## License

This project is open-source under the MIT License.

## Credits

- OpenWeatherMap for weather data API
- Font Awesome for icons
- Flask framework for backend
