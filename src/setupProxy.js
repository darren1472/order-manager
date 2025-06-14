// CRA (http-proxy-middleware) で /api → GAS 実行 URL へ転送
const { createProxyMiddleware } = require('http-proxy-middleware');

const GAS_EXEC_URL =
  'https://script.google.com/macros/s/AKfycbw5nc7Ee4lOwJA-JUgNvl9LyKhX4K1oxqHAuBzaCWaYiKLTZqrTWLXhQzDbTQAtphs/exec';

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: GAS_EXEC_URL,
      changeOrigin: true,
      pathRewrite: { '^/api': '' },          // '/api' を取り除く
      onProxyReq: (_, req) =>
        console.log(`🔄  DEV proxy → ${GAS_EXEC_URL}${req.url.replace(/^\/api/, '')}`)
    })
  );
};
