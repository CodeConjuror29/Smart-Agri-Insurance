const axios = require("axios");
require("dotenv").config();

// 🌦 Fetch weather + extract rainfall
async function getWeather(city) {
    try {
        const apiKey = process.env.WEATHER_API_KEY;

        if (!city) {
            throw new Error("City not provided");
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

        const response = await axios.get(url);

        const data = response.data;

        console.log("Weather API response:", data.name);

        // 🌧 Extract rainfall (mm)
        let rainfall = 0;

        if (data.rain) {
            rainfall = data.rain["1h"] || data.rain["3h"] || 0;
        }
        // If no rain data → assume 0
        console.log(`Rainfall in ${city}:`, rainfall);

        return rainfall;

    } catch (error) {
        console.error("Weather API Error:", error.message);

        // fallback so app doesn't crash
        return 0;
    }
}

module.exports = { getWeather };