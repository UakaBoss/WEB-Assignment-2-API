let map;
let marker;

function displayMap(lat, lon) {
    if (!map) {
        // Creating a new map
        map = L.map('map').setView([lat, lon], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    } else {
        // If the map already exists, then update it
        map.setView([lat, lon], 10);
    }
    if (marker) {
        map.removeLayer(marker);
    }

    // Add a new marker with the updated coordinates
    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup('City Location')
        .openPopup();
}

// Filling Weather, UnsplashImage, News when button is submitted
document.getElementById('weatherForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const cityInput = document.getElementById('cityInput');
    const cityName = cityInput.value.trim();

    // Fetching weather route
    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `city=${cityName}`,
    })
    .then((response) => response.json())
    .then((data) => {
        const weatherInfo = document.getElementById('weatherInfo');
        weatherInfo.innerHTML = `

                <div class="category">
                    <h3>Overall</h3>
                    <p>Temperature: ${data.main.temp} C</p>
                    <p>Feels Like: ${data.main.feels_like} C</p>
                    <p>Weather Description: ${data.weather[0].description}</p>
                    <p>Wind Speed: ${data.wind.speed} m/s</p>
                    <p>Pressure: ${data.main.pressure} hPa</p>
                </div>
                <div class="category">
                    <h3>Air quality</h3>
                    <img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="Weather Icon">
                    <p>Air Quality Index (AQI): ${data.airQuality.list[0].main.aqi}</p>
                    <p>Humidity: ${data.main.humidity}%</p>
                </div>
                <div class="category">
                    <h3>Time-zone</h3>
                    <p>Time Zone: ${data.timeZone.timeZoneId}</p>
                    <p>Country Code: ${data.sys.country}</p>
                    <p>Coordinates: [${data.coord.lat}, ${data.coord.lon}]</p>
                </div>
            `;
        // Fetching unsplashImage route
        fetch(`/unsplashImage?city=${cityName}`)
        .then(response => response.json())
        .then(unsplashData => {
            const weatherImage = document.getElementById('weatherImage');
            weatherImage.src = unsplashData.imageUrl;
        })
        .catch(error => console.error('Error:', error));

        // Fetching news route
        fetch(`/news?city=${cityName}`)
        .then(response => response.json())
        .then(newsData => {
            const newsSection = document.getElementById('newsSection');
            newsSection.innerHTML = `
                <h2>Latest News</h2>
                <ul>
                    ${newsData.articles.map(article => `
                        <li>
                            <strong>${article.title}</strong> - ${article.description}
                        </li>
                    `).join('')}
                </ul>
            `;
            newsSection.style.marginTop = '50px';
        })
        .catch(error => console.error('Error:', error));

        displayMap(data.coord.lat, data.coord.lon);
    })
    .catch((error) => console.error('Error:', error));
});
