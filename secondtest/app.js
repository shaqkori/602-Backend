const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ssm = new AWS.SSM();

const typeDefs = gql`
  type Query {
    getItem(id: String!): Item
  }

  type Item {
    id: String
  }

  type Mutation {
    createItem(id: String!): Item
  }
`;

const resolvers = {
  Query: {
    getItem: async (_, { id }) => {
      try {
        const params = {
          TableName: "testTable",
          Key: { id },
        };
        const result = await dynamoDB.get(params).promise();
        return result.Item;
      } catch (err) {
        console.error("Error getting item:", err);
        throw new Error("Error fetching item");
      }
    },
  },
  Mutation: {
    createItem: async (_, { id }) => {
      try {
        const params = {
          TableName: "testTable",
          Item: { id },
        };
        await dynamoDB.put(params).promise();
        return { id };
      } catch (err) {
        console.error("Error creating item:", err);
        throw new Error("Error creating item");
      }
    },
  },
};

async function getApiGatewayUrl() {
  try {
    const data = await ssm
      .getParameter({
        Name: "/Test/ApiGatewayUrl",
        WithDecryption: false,
      })
      .promise();
    return data.Parameter.Value;
  } catch (error) {
    console.error("Error retrieving API Gateway URL from SSM:", error);
    throw new Error("Could not retrieve API Gateway URL");
  }
}

async function startServer() {
  let apiGatewayUrl;
  try {
    apiGatewayUrl = await getApiGatewayUrl();
  } catch (error) {
    console.error("Failed to retrieve API Gateway URL:", error);
    process.exit(1); // Exit the process with an error code
  }

  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      apiGatewayUrl,
    }),
  });

  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`Server running at http://localhost:4000${server.graphqlPath}`)
  );
}

startServer();
