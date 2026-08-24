// ===============================
// DOM ELEMENTS
// ===============================

const weatherResult = document.getElementById("weatherResult");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");


// ===============================
// WEATHER CODE → CONDITION + ICON
// ===============================

function getWeatherInfo(code) {

    if (code === 0) {
        return {
            condition: "Clear Sky",
            icon: "☀️"
        };
    }

    if (code >= 1 && code <= 3) {
        return {
            condition: "Cloudy",
            icon: "🌤️"
        };
    }

    if (code >= 45 && code <= 48) {
        return {
            condition: "Fog",
            icon: "🌫️"
        };
    }

    if (code >= 51 && code <= 57) {
        return {
            condition: "Drizzle",
            icon: "🌦️"
        };
    }

    if (code >= 61 && code <= 67) {
        return {
            condition: "Rain",
            icon: "🌧️"
        };
    }

    if (code >= 71 && code <= 77) {
        return {
            condition: "Snow",
            icon: "❄️"
        };
    }

    if (code >= 80 && code <= 82) {
        return {
            condition: "Rain Showers",
            icon: "🌦️"
        };
    }

    if (code >= 95 && code <= 99) {
        return {
            condition: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        condition: "Unknown",
        icon: "🌍"
    };
}


// ===============================
// CITY → COORDINATES
// ===============================

async function getCoordinates(city) {

    const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );

    if (!geoResponse.ok) {
        throw new Error("Failed to find location");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
    }

    const location = geoData.results[0];

    return {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude
    };
}


// ===============================
// COORDINATES → WEATHER
// ===============================

async function getWeather(latitude, longitude) {

    const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
    );

    if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather");
    }

    const weatherData = await weatherResponse.json();

    return weatherData.current;
}


// ===============================
// DISPLAY WEATHER
// ===============================

function displayWeather(location, weather) {

    const currentTemperature = weather.temperature_2m;

    const relativeHumidity = weather.relative_humidity_2m;

    const windSpeed = weather.wind_speed_10m;

    const weatherInfo = getWeatherInfo(weather.weather_code);


    weatherResult.innerHTML = `
        <div
            class="weather-card
            mt-6
            bg-white/20
            backdrop-blur-md
            border border-white/30
            rounded-xl
            p-5"
        >

            <h2 class="text-2xl font-bold text-gray-800">
                ${location.name}
            </h2>


            <p class="text-5xl font-bold text-blue-500 mt-3">
                ${currentTemperature}°C
            </p>


            <div class="text-6xl my-3">
                ${weatherInfo.icon}
            </div>


            <p class="text-lg text-gray-600 mt-2">
                ${weatherInfo.condition}
            </p>


            <div class="grid grid-cols-2 gap-4 mt-6">


                <!-- Humidity -->

                <div class="bg-white/30 rounded-xl p-4">

                    <p class="text-sm text-gray-600">
                        Humidity
                    </p>

                    <p class="text-xl font-semibold text-gray-800">
                        ${relativeHumidity}%
                    </p>

                </div>


                <!-- Wind -->

                <div class="bg-white/30 rounded-xl p-4">

                    <p class="text-sm text-gray-600">
                        Wind
                    </p>

                    <p class="text-xl font-semibold text-gray-800">
                        ${windSpeed} km/h
                    </p>

                </div>

            </div>

        </div>
    `;
}


// ===============================
// SEARCH BUTTON
// ===============================

searchBtn.addEventListener("click", async function () {

    const city = cityInput.value.trim();


    // ===============================
    // EMPTY INPUT
    // ===============================

    if (city === "") {

        weatherResult.innerHTML = `
            <p class="text-red-500 font-semibold">
                Please enter a city name.
            </p>
        `;

        return;
    }


    try {

        // ===============================
        // LOADING
        // ===============================

        searchBtn.disabled = true;
        searchBtn.textContent = "Loading...";

        weatherResult.innerHTML = `
            <p class="text-gray-600 font-semibold animate-pulse">
                Loading weather...
            </p>
        `;


        // ===============================
        // CITY → COORDINATES
        // ===============================

        const location = await getCoordinates(city);


        // ===============================
        // COORDINATES → WEATHER
        // ===============================

        const weather = await getWeather(
            location.latitude,
            location.longitude
        );


        // ===============================
        // DISPLAY
        // ===============================

        displayWeather(location, weather);

    }


    // ===============================
    // ERROR
    // ===============================

    catch (error) {

        console.error(error);

        weatherResult.innerHTML = `
            <p class="text-red-500 font-semibold">
                Something went wrong. Please try again.
            </p>
        `;
    }


    // ===============================
    // ALWAYS RUNS
    // ===============================

    finally {

        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }

});


// ===============================
// ENTER KEY
// ===============================

cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter" && !event.repeat) {
        searchBtn.click();
    }

});
