// netlify/functions/api.js
exports.handler = async (event, context) => {
  // クエリパラメータ dummy を取得
  const dummy = event.queryStringParameters?.dummy || null;

  // レスポンスを返す
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "success", dummy })
  };
};
