const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME;
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

exports.handler = async () => {
  const result = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
  const partidos = (result.Items || []).sort((a, b) =>
    (a.fecha || "").localeCompare(b.fecha || "")
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ partidos, total: partidos.length }),
  };
};
