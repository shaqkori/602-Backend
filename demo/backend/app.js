const express = require("express");
const axios = require("axios");
const app = express();

// Middleware to parse JSON
app.use(express.json());

// API Gateway endpoint (from CloudFormation output)
const API_GATEWAY_URL = process.env.API_ENDPOINT;

// Fetch data from API Gateway (Lambda)
app.get("/data", async (req, res) => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/data`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Submit data to API Gateway (Lambda)
app.post("/data", async (req, res) => {
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/data`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Error submitting data:", error.message);
    res.status(500).json({ error: "Failed to submit data" });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend service running on port ${PORT}`);
});
