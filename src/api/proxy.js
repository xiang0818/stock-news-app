// api/proxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  createProxyMiddleware({
    target: 'https://news.10jqka.com.cn', // 目标接口地址
    changeOrigin: true,
    pathRewrite: { '^/api': '' }, // 去除路径中的 /api 前缀
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', // 模拟浏览器请求头
      'Referer': 'https://news.10jqka.com.cn'
    }
  })(req, res);
};