import React, { useState, useEffect } from "react";
import AWS from "aws-sdk";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";

const SSM = new AWS.SSM({ region: "us-east-1" }); // Change to your AWS region

const userPool = new CognitoUserPool({
  UserPoolId: "us-east-1_IBhebm30q", // Replace with SSM-retrieved value
  ClientId: "68dhbiaf1nv91pq0ntn69k7878", // Replace with SSM-retrieved value
});

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [token, setToken] = useState("");

  // Fetch API Gateway URL from SSM Parameter Store
  const fetchApiUrl = async () => {
    try {
      const params = {
        Name: "myapp/apiGatewayUrl", // The parameter name in SSM
        WithDecryption: true,
      };
      const response = await SSM.getParameter(params).promise();
      setApiUrl(response.Parameter.Value);
    } catch (error) {
      console.error("Error fetching API URL:", error);
    }
  };

  // Authenticate User with Cognito
  const login = (username, password) => {
    const user = new CognitoUser({ Username: username, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: username, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        setToken(session.getIdToken().getJwtToken());
      },
      onFailure: (err) => {
        console.error("Login failed:", err);
      },
    });
  };

  // Fetch data from backend
  const fetchData = async () => {
    if (!apiUrl) return; // Ensure API URL is available
    try {
      const response = await fetch(`${apiUrl}/Prod/data`, {
        method: "GET",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Add new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiUrl) return;

    try {
      await fetch(`${apiUrl}/Prod/data`, {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newItem }),
      });
      setNewItem("");
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  useEffect(() => {
    fetchApiUrl(); // Get API Gateway URL on load
  }, []);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, apiUrl]);

  return (
    <div className="App">
      <h1>demo app </h1>

      {/* Login Section */}
      <div>
        <h2>Login</h2>
        <input type="text" id="username" placeholder="Username" />
        <input type="password" id="password" placeholder="Password" />
        <button onClick={() => login(document.getElementById("username").value, document.getElementById("password").value)}>Login</button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Enter new item"
        />
        <button type="submit">Add Item</button>
      </form>

      <h2>Items List</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.content}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;