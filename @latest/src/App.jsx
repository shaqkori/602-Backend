import React, { useState, useEffect } from "react";
import axios from "axios";

const API_GATEWAY_URL = "	https://d60an5nc0i.execute-api.us-east-1.amazonaws.com/Prod/data" // Replace with your API Gateway URL

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_GATEWAY_URL);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  return (
    <div style={{ }}>
      <h1>Data from API Gateway</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <ul>
          {data.map((item, index) => (
            <p key={index}>{JSON.stringify(item)}</p>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;