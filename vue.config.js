module.exports = {
    
    devServer: {
      proxy: {
        '/api': {
          target: 'https://news.10jqka.com.cn',
          changeOrigin: true,
          pathRewrite: {
            '^/api': ''
          }
        }
      }
    },
    lintOnSave: process.env.NODE_ENV !== 'production', // 确保开发环境启用
    pluginOptions: {
      lintStyleOnBuild: true,
      eslint: {
        configFile: '.eslintrc.js' // 强制指定配置文件路径
      }
    }
  };