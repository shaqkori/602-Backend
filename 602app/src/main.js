// AWS SDK Setup
AWS.config.region = "us-east-1"; // Replace with your AWS region

// Function to get a parameter from SSM Parameter Store
async function getSSMParameter(parameterName) {
  const ssm = new AWS.SSM();
  const params = { Name: parameterName, WithDecryption: true };

  try {
    const data = await ssm.getParameter(params).promise();
    return data.Parameter.Value;
  } catch (error) {
    console.error(`Error fetching parameter ${parameterName}:`, error);
    return null;
  }
}

// Initialize AWS with Cognito Identity Pool from SSM
async function initializeAWS() {
  const identityPoolId = await getSSMParameter("/cognito/userpool-id");
  if (!identityPoolId) {
    console.error("Failed to retrieve Cognito Identity Pool ID");
    return;
  }

  AWS.config.credentials = new AWS.CognitoIdentity({
    IdentityPoolId: identityPoolId,
  });

  // Proceed to fetch API data once AWS setup is done
  fetchData();
}

// Fetch the API URL stored in SSM and add endpoint path
async function getApiUrl() {
  const baseUrl = await getSSMParameter("/myApp/apiEndpoint");
  if (baseUrl) {
    return `${baseUrl}/Prod/data`; // Append '/data' or any path to the base URL
  }
  return null;
}

// Fetch data from the API Gateway /data endpoint
async function fetchData() {
  const output = document.getElementById("output");
  output.textContent = "Fetching data...";

  // Get the API Gateway URL from SSM and append the '/data' path
  const apiUrl = await getApiUrl();
  if (!apiUrl) {
    output.textContent = "Failed to fetch API URL.";
    return;
  }

  try {
    // Call the API Gateway using the credentials from Cognito
    await AWS.config.credentials.getPromise();
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: AWS.config.credentials.sessionToken,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error fetching data:", error);
    output.textContent = "Error fetching data.";
  }
}

// Initialize AWS when the page loads
initializeAWS();

// Attach event listener to fetch data button
const fetchDataButton = document.getElementById("fetchData");
if (fetchDataButton) {
  fetchDataButton.addEventListener("click", fetchData);
}
