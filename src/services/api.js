import axios from 'axios';

const newsApi = {
  getNews(page = 1, tag = '', ctime = '') {
    let url = `/api/tapp/news/push/stock/?page=${page}&tag=${tag}&track=website&pagesize=20`;
    if (ctime) {
      url += `&ctime=${ctime}`;
    }
    return axios.get(url);
  },
  
  // 获取首页200条新闻
  getInitialNews(tag = '') {
    let url = `/api/tapp/news/push/stock/?page=1&tag=${tag}&track=website&pagesize=200`;
    return axios.get(url);
  }
};

export default newsApi;