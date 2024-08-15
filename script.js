
async function getWeather() {
    const apiKey = 'f7dbac60cb96e5055c4e3c248ee82820';
    const city = document.getElementById('city').value.trim(); 

    if (!city) {
        alert('Please enter a city');
        return; 
    }

    try {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

        // Fetch current weather and forecast data simultaneously
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!currentWeatherResponse.ok) {
            throw new Error('City not found');
        }
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available');
        }

        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();

        // Display the weather and forecast data
        displayWeather(currentWeatherData);
        displayHourlyForecast(forecastData.list);

        // Save the city to history and update history display
        await saveToHistory(city);
        displayHistory();

    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching data. Please try again.');
    }
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    weatherInfoDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperature = Math.round(data.main.temp - 273.15); 
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const temperatureHTML = `<p>${temperature}°C</p>`;
        const weatherHtml = `<p>${cityName}</p><p>${description}</p>`;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;

        weatherIcon.style.display = 'block'; 
    }
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = ''; 

    const next24Hours = hourlyData.slice(0, 8); 
    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp - 273.15); 
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}

async function saveToHistory(city) {
    const apiKey = 'f7dbac60cb96e5055c4e3c248ee82820';
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    try {
        const response = await fetch(currentWeatherUrl);
        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        const cityName = data.name;
        const temperature = Math.round(data.main.temp - 273.15); 
        
        const historyList = JSON.parse(localStorage.getItem('history')) || [];
        const historyItem = { cityName, temperature };

        // Remove any existing entry for this city
        const updatedHistory = historyList.filter(item => item.cityName !== cityName);
        updatedHistory.push(historyItem);

        localStorage.setItem('history', JSON.stringify(updatedHistory));
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

function displayHistory() {
    const historyList = JSON.parse(localStorage.getItem('history')) || [];
    const historyUl = document.getElementById('history-list');
    historyUl.innerHTML = '';

    historyList.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.cityName}: ${item.temperature}°C`;
        li.addEventListener('click', () => {
            document.getElementById('city').value = item.cityName;
            getWeather();
        });
        historyUl.appendChild(li);
    });
}

function clearHistory() {
    localStorage.removeItem('history');
    displayHistory();
}

// Clear history on page load
clearHistory();

// Initialize the history display
displayHistory();