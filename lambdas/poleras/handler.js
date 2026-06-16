const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const s3 = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

exports.handler = async () => {
  const result = await s3.send(
    new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: "poleras/" })
  );

  const poleras = (result.Contents || [])
    .filter((obj) => /\.(png|jpg|jpeg|svg)$/i.test(obj.Key))
    .map((obj) => ({
      archivo: obj.Key.split("/").pop(),
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${obj.Key}`,
    }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ poleras, total: poleras.length }),
  };
};
