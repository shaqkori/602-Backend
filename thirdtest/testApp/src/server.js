const express = require("express");
const axios = require("axios");
const AWS = require("aws-sdk");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

const ssm = new AWS.SSM();

// Fetch parameters from Parameter Store
const fetchParameters = async () => {
  const params = {
    Names: [
      "/myapp/RDS_HOST",
      "/myapp/RDS_USER",
      "/myapp/RDS_PASSWORD",
      "/myapp/RDS_DATABASE",
      "/myapp/apiurl",
    ],
    WithDecryption: true,
  };

  const data = await ssm.getParameters(params).promise();
  const envVariables = {};
  data.Parameters.forEach((param) => {
    const name = param.Name.split("/").pop();
    envVariables[name] = param.Value;
  });

  return envVariables;
};

// Endpoint to get environment variables
app.get("/env", async (req, res) => {
  try {
    const envVariables = await fetchParameters();
    res.json(envVariables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all items from API Gateway
app.get("/data", async (req, res) => {
  try {
    const envVariables = await fetchParameters();
    const apiUrl = envVariables.apiurl + "/data";
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new item to API Gateway
app.post("/data", async (req, res) => {
  try {
    const envVariables = await fetchParameters();
    const apiUrl = envVariables.apiurl + "/data";
    const { content } = req.body;
    const response = await axios.post(apiUrl, { content });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
