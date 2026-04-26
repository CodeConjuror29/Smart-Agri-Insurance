const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { getWeather } = require("./weather");
const { updateWeatherOnChain, getPolicy } = require("./blockchain");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
    res.send("Backend running");
});


// 🌦 GET WEATHER (dynamic city)
app.get("/weather", async (req, res) => {
    try {
        const city = req.query.city;

        if (!city) {
            return res.status(400).json({ error: "City is required" });
        }

        const rainfall = await getWeather(city);

        res.json({
            city,
            rainfall
        });

    } catch (error) {
        console.error("Weather Route Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});


// 🔄 UPDATE RAINFALL ON BLOCKCHAIN
app.post("/update-weather", async (req, res) => {
    try {
        const { city } = req.body;

        if (!city) {
            return res.status(400).json({ error: "City is required" });
        }

        // 🌧 Fetch rainfall
        const rainfall = await getWeather(city);

        console.log("Rainfall:", rainfall);

        // ⛓ Update contract
        const tx = await updateWeatherOnChain(rainfall);

        res.json({
            message: "Rainfall updated on blockchain",
            city,
            rainfall,
            txHash: tx.transactionHash
        });

    } catch (error) {
        console.error("Update Weather Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});


// 📊 GET POLICY DATA
app.get("/policy", async (req, res) => {
    try {
        const policy = await getPolicy();

        res.json({
            farmer: policy[0],
            insuredAmount: policy[1],
            rainfallThreshold: policy[2],
            recordedRainfall: policy[3],
            status: policy[4] === "0" ? "Active" : "PaidOut"
        });

    } catch (error) {
        console.error("Get Policy Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});


// 🚀 Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});