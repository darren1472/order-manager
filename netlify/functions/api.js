// netlify/functions/api.js
exports.handler = async (event, context) => {
  const dummy = event.queryStringParameters?.dummy || null;
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "success", dummy })
  };
};
