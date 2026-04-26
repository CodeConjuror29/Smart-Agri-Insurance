import React, { useState } from "react";
import {
  loadWeb3,
  loadContract,
  createPolicy
} from "./contract";

import { getWeather, updateWeather, fetchPolicy } from "./api";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  const [farmer, setFarmer] = useState("");
  const [amount, setAmount] = useState("");
  const [threshold, setThreshold] = useState("");

  const [location, setLocation] = useState("");

  const [output, setOutput] = useState("");

  // 🔗 Connect Wallet
  const connectWallet = async () => {
    try {
      await loadWeb3();
      const { contract, account } = await loadContract();
      setContract(contract);
      setAccount(account);
      setOutput("Wallet Connected");
    } catch (err) {
      console.error(err);
      setOutput("Error connecting wallet");
    }
  };

  // 📄 Create Policy (ADMIN ONLY)
  const handleCreatePolicy = async () => {
    try {
      if (!farmer || !amount || !threshold) {
        setOutput("Please fill all fields");
        return;
      }

      await createPolicy(contract, account, farmer, amount, threshold);
      setOutput("Policy Created Successfully!");
    } catch (err) {
      console.error(err);
      setOutput("Error creating policy (Are you admin?)");
    }
  };

  // 🌦 Get Weather
  const handleGetWeather = async () => {
    try {
      if (!location) {
        setOutput("Enter city");
        return;
      }

      const data = await getWeather(location);
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setOutput("Error fetching weather");
    }
  };

  // 🔄 Update Rainfall (Backend → Blockchain)
  const handleUpdateWeather = async () => {
    try {
      if (!location) {
        setOutput("Enter city");
        return;
      }

      const data = await updateWeather(location);
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setOutput("Error updating rainfall");
    }
  };

  // 📊 View Policy
  const handleGetPolicy = async () => {
    try {
      const data = await fetchPolicy();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setOutput("Error fetching policy");
    }
  };

  return (
  <div className="container">

    {/* HEADER */}
    <div className="header">
      <h2>🌾 Agri Insurance Dashboard</h2>
      <p>Smart Contract Based Crop Insurance System</p>
    </div>

    {/* WALLET */}
    <div className="card">
      <button onClick={connectWallet}>Connect Wallet</button>
      <p><b>Account:</b> {account || "Not Connected"}</p>
    </div>

    {/* GRID */}
    <div className="grid">

      {/* CREATE POLICY */}
      <div className="card">
        <h3>Create Policy</h3>

        <input
          placeholder="Farmer Address"
          value={farmer}
          onChange={(e) => setFarmer(e.target.value)}
        />

        <input
          placeholder="Insured Amount (wei)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          placeholder="Rainfall Threshold"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />

        <button onClick={handleCreatePolicy}>Create</button>
      </div>

      {/* WEATHER */}
      <div className="card">
        <h3>Weather Oracle</h3>

        <input
          placeholder="Enter City"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button onClick={handleGetWeather}>Get Weather</button>
        <button onClick={handleUpdateWeather}>Update Rainfall</button>
      </div>

      {/* POLICY */}
      <div className="card">
        <h3>Policy Data</h3>
        <button onClick={handleGetPolicy}>Fetch Policy</button>
      </div>

      {/* OUTPUT */}
      <div className="card">
        <h3>System Output</h3>
        <pre className="output">{output}</pre>
      </div>

    </div>
  </div>
);
}

export default App;