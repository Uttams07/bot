document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    
    // Load default weather (London)
    fetchWeather('London');
    
    // Setup event listeners
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    });
    
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                fetchWeather(city);
            }
        }
    });
});

async function fetchWeather(city) {
    try {
        // Show loading state
        document.getElementById('current-icon').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.getElementById('current-temp').textContent = 'Loading...';
        
        const response = await fetch('/get_weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ city })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch weather data');
        }
        
        const data = await response.json();
        updateCurrentWeather(data.current);
        updateForecast(data.forecast);
        
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
        // Reset to default view
        document.getElementById('current-icon').innerHTML = '<i class="fas fa-cloud"></i>';
        document.getElementById('current-temp').textContent = '--°C';
    }
}

function updateCurrentWeather(data) {
    document.getElementById('current-city').textContent = data.city;
    document.getElementById('current-description').textContent = data.description;
    document.getElementById('current-icon').innerHTML = 
        `<img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="${data.description}">`;
    document.getElementById('current-temp').textContent = `${data.temp}°C`;
    document.getElementById('feels-like').textContent = `${data.feels_like}°C`;
    document.getElementById('humidity').textContent = `${data.humidity}%`;
    document.getElementById('wind-speed').textContent = `${data.wind} km/h`;
    document.getElementById('sunrise').textContent = data.sunrise;
    document.getElementById('sunset').textContent = data.sunset;
}

function updateForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast-items');
    forecastContainer.innerHTML = '';
    
    forecastData.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${day.day}</div>
            <div class="forecast-date">${day.date}</div>
            <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}">
            </div>
            <div class="forecast-temp">
                <span class="temp-max">${day.temp_max}°</span> / 
                <span class="temp-min">${day.temp_min}°</span>
            </div>
            <div class="forecast-desc">${day.description}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}