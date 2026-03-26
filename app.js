function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    // ✅ NEW (recent searches)
    this.recentContainer = document.getElementById("recent-searches-container");
    this.recentSearches = [];
    this.maxRecent = 5;

    this.init();
}

// INIT
WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    });

    // ✅ LOAD FEATURES
    this.loadRecent();
    this.loadLastCity();

    if (!localStorage.getItem('lastCity')) {
        this.showWelcome();
    }
};

// HANDLE SEARCH
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Enter city name");
        return;
    }

    this.getWeather(city);
};

// GET WEATHER
WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();

    try {
        const current = await axios.get(
            `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`
        );

        this.displayWeather(current.data);

        // ✅ SAVE LAST CITY
        localStorage.setItem('lastCity', city);

        // ✅ SAVE RECENT SEARCH
        this.saveRecentSearch(city);

        try {
            const forecast = await this.getForecast(city);
            this.displayForecast(forecast);
        } catch (e) {
            console.log("Forecast failed");
        }

    } catch (error) {
        this.showError("City not found");
    }
};

// ✅ SAVE RECENT
WeatherApp.prototype.saveRecentSearch = function (city) {
    const name = city.toLowerCase();

    this.recentSearches = this.recentSearches.filter(c => c !== name);
    this.recentSearches.unshift(name);

    if (this.recentSearches.length > this.maxRecent) {
        this.recentSearches.pop();
    }

    localStorage.setItem('recent', JSON.stringify(this.recentSearches));

    this.displayRecent();
};

// ✅ LOAD RECENT
WeatherApp.prototype.loadRecent = function () {
    const data = localStorage.getItem('recent');

    if (data) {
        this.recentSearches = JSON.parse(data);
        this.displayRecent();
    }
};

// ✅ DISPLAY BUTTONS
WeatherApp.prototype.displayRecent = function () {
    if (!this.recentContainer) return;

    this.recentContainer.innerHTML = "";

    this.recentSearches.forEach(city => {
        const btn = document.createElement("button");
        btn.textContent = city;
        btn.className = "recent-btn";

        btn.onclick = () => {
            this.cityInput.value = city;
            this.getWeather(city);
        };

        this.recentContainer.appendChild(btn);
    });
};

// LOAD LAST CITY
WeatherApp.prototype.loadLastCity = function () {
    const lastCity = localStorage.getItem('lastCity');

    if (lastCity) {
        this.getWeather(lastCity);
    }
};

// GET FORECAST
WeatherApp.prototype.getForecast = async function (city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await axios.get(url);
    return response.data;
};

// PROCESS FORECAST
WeatherApp.prototype.processForecastData = function (data) {
    return data.list
        .filter(item => item.dt_txt.includes("12:00:00"))
        .slice(0, 5);
};

// DISPLAY WEATHER
WeatherApp.prototype.displayWeather = function (data) {
    const html = `
        <h2>${data.name}</h2>
        <p>${Math.round(data.main.temp)}°C</p>
        <p>${data.weather[0].description}</p>
    `;

    this.weatherDisplay.innerHTML = html;
};

// DISPLAY FORECAST
WeatherApp.prototype.displayForecast = function (data) {
    const days = this.processForecastData(data);

    const html = days.map(day => {
        const date = new Date(day.dt * 1000);
        const name = date.toLocaleDateString('en-US', { weekday: 'short' });

        return `
            <div class="forecast-card">
                <h4>${name}</h4>
                <p>${Math.round(day.main.temp)}°C</p>
                <p>${day.weather[0].description}</p>
            </div>
        `;
    }).join('');

    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3>5-Day Forecast</h3>
            <div class="forecast-container">
                ${html}
            </div>
        </div>
    `;
};

// LOADING
WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `<p>Loading...</p>`;
};

// ERROR
WeatherApp.prototype.showError = function (msg) {
    this.weatherDisplay.innerHTML = `<p style="color:red;">${msg}</p>`;
};

// WELCOME
WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `<p>Enter a city name to start</p>`;
};

// CREATE APP
const app = new WeatherApp('65a48071381d76989322ddc92cd07d06');