const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "fd79d805c14820532988d0976cc753e6"; //API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0 ) { //HTML for the main weather card
        return `<div class="details">
                    <h3>${cityName} (${weatherItem.dt_txt.split("  ")[0]})</h3>
                    <h4>Suhu: ${(weatherItem.main.temp - 302.09).toFixed(2)}°C</h4>
                    <h4>Angin: ${weatherItem.wind.speed}M/S</h4>
                    <h4>kelembapan: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png"alt="weather-icon"/>
                    <h4> ${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {    //HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png"alt="weather-icon"/>
                    <h4>Suhu: ${(weatherItem.main.temp - 302.09).toFixed(2)}°C</h4>
                    <h4>Angin: ${weatherItem.wind.speed}M/S</h4>
                    <h4>kelembapan: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        // Filter the forecast to get only one forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecastDays = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if(!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
            }
        });

        // clearing provious weather data
        cityInput.value = "";
        currentWeatherDiv.value = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecastDays.forEach((weatherItem, index) => {
            if(index === 0 ) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }

        });
    }).catch(() => {
        alert("Terjadi kesalahan saat mengambil ramalan cuaca!");
    });

}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // Get user entered city name and remove extra spaces
    if(!cityName) return;// Return if ciyName is empty
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

    //Get entered city coordinates (latitude, longtitude, and name) from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`Tidak ditemukan koordinat untuk ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("Terjadi kesalahan saat mengambil koordinat");
    });

}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;    
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            // Get city name from coordinates using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("Terjadi kesalahan saat mengambil koordinat");
            });
        },
        Error => {
            if(Error.code === Error.PERMISSION_DENIED) {
                alert("Permintaan lokasi ditolak. Harap setel ulang izin lokasi untuk memberikan akses lagi.")
            }
        }   
    )
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates);