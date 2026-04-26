import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";   // ✅ make sure styles are loaded
import App from "./App";

// Create root
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);