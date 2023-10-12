const apiKey = '18d3286a03db24d0d06333fb03b232ed'; 
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('search');
const weatherInfo = document.getElementById('weatherInfo');
const forecast = document.getElementById('forecast');
const map = L.map('map').setView([0, 0], 2);
const errorDiv = document.getElementById('error');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

searchButton.addEventListener('click', () => {
    const cityName = searchInput.value;
    if (cityName) {
        getWeather(cityName);
    } else {
        showError('Please enter a city name');  
    }
});

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }, 5000);
}

function getWeather(cityName) {
    // Show loaders while fetching data
    weatherInfo.innerHTML = '<div class="loader"></div>';
    forecast.innerHTML = '<div class="loader"></div>';

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            // Display weather information
            const temperature = data.main.temp;
            const description = data.weather[0].description;
            const cityName = data.name;

            const weatherText = `Weather in ${cityName}: ${temperature}°C, ${description}`;
            weatherInfo.innerHTML = weatherText;

            const lat = data.coord.lat;
            const lon = data.coord.lon;
            map.setView([lat, lon], 10);
        })
        .catch(error => {
            showError('City not found. Please try again.');
            console.error('Error fetching weather data:', error);
        });

    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast data not available');
            }
            return response.json();
        })
        .then(data => {
            // Display 5-day forecast
            const forecastList = data.list.slice(0, 5);

            forecast.innerHTML = '<h2>5-Day Forecast</h2>';
            forecastList.forEach(item => {
                const date = new Date(item.dt * 1000);
                const temperature = item.main.temp;
                const description = item.weather[0].description;

                const forecastText = `${date.toLocaleDateString()}: ${temperature}°C, ${description}`;
                forecast.innerHTML += `<p>${forecastText}</p>`;
            });
        })
        .catch(error => {
            showError('Forecast data not available.');
            console.error('Error fetching forecast data:', error);
        });
}

// Use geolocation to get the user's location
function getLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            map.setView([lat, lon], 10);
        }, error => {
            showError('Error getting geolocation.');
            console.error('Error getting geolocation:', error);
        });
    } else {
        showError('Geolocation not supported by your browser.');
    }
}

getLocation(); // Call geolocation function on page load
