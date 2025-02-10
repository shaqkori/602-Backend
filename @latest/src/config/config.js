export const amplifyConfig = {
  Auth: {
    userPoolId: "us-east-1_IBhebm30q",
    userPoolWebClientId: "68dhbiaf1nv91pq0ntn69k7878",
  },
  API: {
    endpoints: [
      {
        name: "MyAPIGateway",
        endpoint: "https://d60an5nc0i.execute-api.us-east-1.amazonaws.com/Prod",
        region: "us-east-1",
      },
    ],
  },
};
