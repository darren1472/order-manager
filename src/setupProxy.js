// ------------------------------------------
// setupProxy.js（安定・推奨バージョン）
// Create React App で /api へのアクセスを GAS Web Apps 実行URL に転送（Proxy）する
// ------------------------------------------
const { createProxyMiddleware } = require('http-proxy-middleware');

// ① GAS の「ウェブアプリ」の実行URL（/exec で終わる短いほう！）
const GAS_EXEC_URL = 'https://script.google.com/macros/s/AKfycbx_wqLiK2xYYz7XIclJ4txcwt6E72dSFtQbFdEZvTeK0MmRqafGgecHduUgtYLiai_R/exec';

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: GAS_EXEC_URL,
      changeOrigin: true,
      secure: true,
      timeout: 30000,

      // パスから '/api' だけを削除（?以降のクエリは維持）
      pathRewrite: (path, req) => {
        return path.replace(/^\/api/, '');
      },

      followRedirects: true,

      // プロキシリクエストのログ出力（pathのバグ回避で req.url を使う）
      onProxyReq: (proxyReq, req, res) => {
        if (process.env.NODE_ENV === 'development') {
          const proxyPath = req.url.replace(/^\/api/, '');
          console.log(`✅ [Proxy Request] ${req.method} ${req.originalUrl}`);
          console.log(`🔄 Forwarding to: ${GAS_EXEC_URL}${proxyPath}`);
        }
      },

      // プロキシレスポンスの処理
      onProxyRes: (proxyRes, req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (process.env.NODE_ENV === 'development') {
          console.log(`📨 [Proxy Response] ${proxyRes.statusCode} ${proxyRes.statusMessage} for ${req.originalUrl}`);
          console.log('--- Proxy Response Headers ---');
          for (const header in proxyRes.headers) {
            console.log(`${header}: ${proxyRes.headers[header]}`);
          }
          console.log('------------------------------');

          if (proxyRes.statusCode === 200) {
            console.log('🎉 [Success] GAS communication successful!');
          }
        }
      },

      // エラーハンドリング
      onError: (err, req, res) => {
        console.error('🚨 [Proxy Error]', err);
        if (res && !res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'application/json'
          });
          const json = {
            status: 'error',
            message: 'Proxy Error',
            error: err.message
          };
          res.end(JSON.stringify(json));
        }
      }
    })
  );

  if (process.env.NODE_ENV === 'development') {
    console.log('🎉 === Proxy Settings Loaded (Stable Version) ===');
    console.log(`🎯 GAS Target URL: ${GAS_EXEC_URL}`);
    console.log(`🌐 API Endpoint: /api`);
    console.log('====================================================');
  }
};
