const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// 🌦 Get weather for a specific city
export const getWeather = async (city) => {
  try {
    const res = await fetch(`${BASE_URL}/weather?city=${city}`);

    if (!res.ok) {
      throw new Error("Failed to fetch weather");
    }

    return await res.json();

  } catch (error) {
    console.error("API Error (getWeather):", error.message);
    throw error;
  }
};

// 🔄 Update rainfall on blockchain via backend
export const updateWeather = async (city) => {
  try {
    const res = await fetch(`${BASE_URL}/update-weather`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ city })
    });

    if (!res.ok) {
      throw new Error("Failed to update rainfall");
    }

    return await res.json();

  } catch (error) {
    console.error("API Error (updateWeather):", error.message);
    throw error;
  }
};

// 📊 Fetch policy data from backend
export const fetchPolicy = async () => {
  try {
    const res = await fetch(`${BASE_URL}/policy`);

    if (!res.ok) {
      throw new Error("Failed to fetch policy");
    }

    return await res.json();

  } catch (error) {
    console.error("API Error (fetchPolicy):", error.message);
    throw error;
  }
};