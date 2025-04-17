import axios from 'axios';

// 创建一个axios实例，设置超时和headers
const apiClient = axios.create({
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const getBaseUrl = () => {
  // 使用CloudFlare Workers或其他代理服务来解决CORS问题
  return "https://cf-proxy.kkkkkkkkk.workers.dev/http://news.10jqka.com.cn";
};

const handleApiError = (error) => {
  if (error.response) {
    // 服务器返回了错误状态码
    console.error('API响应错误:', error.response.status, error.response.data);
    return Promise.reject(new Error(`服务器响应错误: ${error.response.status}`));
  } else if (error.request) {
    // 请求已发送但没有收到响应
    console.error('无法连接到服务器:', error.request);
    return Promise.reject(new Error('无法连接到服务器，请检查网络连接'));
  } else {
    // 在设置请求时发生错误
    console.error('请求配置错误:', error.message);
    return Promise.reject(new Error(`请求错误: ${error.message}`));
  }
};

const newsApi = {
  async getNews(page = 1, tag = '', ctime = '') {
    try {
      let url = `${getBaseUrl()}/tapp/news/push/stock/?page=${page}&tag=${tag}&track=website&pagesize=20`;
      if (ctime) {
        url += `&ctime=${ctime}`;
      }
      const response = await apiClient.get(url);
      
      // 验证响应数据结构
      if (!response.data || !response.data.data) {
        throw new Error('无效的API响应格式');
      }
      
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // 获取首页200条新闻
  async getInitialNews(tag = '') {
    try {
      let url = `${getBaseUrl()}/tapp/news/push/stock/?page=1&tag=${tag}&track=website&pagesize=100`;
      const response = await apiClient.get(url);
      
      // 验证响应数据结构
      if (!response.data || !response.data.data) {
        throw new Error('无效的API响应格式');
      }
      
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default newsApi;