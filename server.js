// Modules
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

// APIs
const OPENWEATHER_API_KEY = '7fa2ce890857d662f753d45879891048';
const NEWS_API_KEY = 'dc4ff6529c5341d89f7fe2a57e1a09f9';
const GOOGLE_MAPS_API_KEY = 'AIzaSyDCHE7qW8F-f-mqTRshUgYwPbcqJlLMTtw';
const UNSPLASH_API_KEY = 'emhDKnbBjSZm5knLtXObZwEi5-MmYJaOlkXI-MmnwU4';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
// Accesing static folder
app.use(express.static(path.join(__dirname, 'static')));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Weather route
app.post('/weather', async (req, res) => {
    const cityName = req.body.city;
    try {
        const weatherData = await getWeatherData(cityName);
        const airQualityData = await getAirQuality(weatherData.coord.lat, weatherData.coord.lon);
        const timeZoneData = await getTimeZone(weatherData.coord.lat, weatherData.coord.lon);

        weatherData.main.temp = convertKelvinToCelsius(weatherData.main.temp);
        weatherData.main.feels_like = convertKelvinToCelsius(weatherData.main.feels_like);

        res.json({ ...weatherData, airQuality: airQualityData, timeZone: timeZoneData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

function convertKelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

// Get Weather Data, Air Quality and Time Zone info from openweathermap
async function getWeatherData(cityName) {
    try {
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OPENWEATHER_API_KEY}`);
        const weatherData = response.data;
        return weatherData;
    } catch (error) {
        throw error;
    }
}

async function getAirQuality(lat, lon) {
    try {
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch air quality data:', error);
        return null;
    }
}

async function getTimeZone(lat, lon) {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${Math.floor(Date.now() / 1000)}&key=${GOOGLE_MAPS_API_KEY}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch time zone data:', error);
        return null;
    }
}

// UnsplashImage route
app.get('/unsplashImage', async (req, res) => {
    const cityName = req.query.city;
    try {
        const unsplashResponse = await axios.get(`https://api.unsplash.com/photos/random?query=${cityName}&client_id=${UNSPLASH_API_KEY}`);
        const imageUrl = unsplashResponse.data.urls.regular;

        res.json({ imageUrl });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch Unsplash image' });
    }
});

// News route
app.get('/news', async (req, res) => {
    const cityName = req.query.city;
    try {
        const newsData = await getNews(cityName);
        res.json(newsData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch news data' });
    }
});

async function getNews(city) {
    try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: city,
                language: 'en',
                apiKey: NEWS_API_KEY,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});