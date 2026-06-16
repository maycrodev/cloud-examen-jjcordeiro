const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME;
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

exports.handler = async (event) => {
  const id = event.pathParameters?.id || event.queryStringParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Debes enviar el id del partido" }),
    };
  }

  const result = await client.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Partido no encontrado" }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Item),
  };
};
