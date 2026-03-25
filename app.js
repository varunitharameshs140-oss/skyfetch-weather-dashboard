// API details
const API_KEY = '65a48071381d76989322ddc92cd07d06';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Fetch weather (ASYNC/AWAIT)
async function getWeather(city) {
    showLoading();

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        displayWeather(response.data);
    } catch (error) {
        showError("City not found");
    }
}

// Display weather
function displayWeather(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const weatherHTML = `
        <div class="weather-info">
            <h2>${cityName}</h2>
            <img src="${iconUrl}" />
            <p>${temperature}°C</p>
            <p>${description}</p>
        </div>
    `;

    document.getElementById("weather-display").innerHTML = weatherHTML;
}

// Loading
function showLoading() {
    document.getElementById("weather-display").innerHTML =
        `<p>Loading...</p>`;
}

// Error
function showError(message) {
    document.getElementById("weather-display").innerHTML =
        `<p style="color:red;">${message}</p>`;
}

// Button + input
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

searchBtn.addEventListener("click", function () {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name");
        return;
    }

    getWeather(city);
});

// Enter key
cityInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});