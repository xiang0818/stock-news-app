import axios from 'axios';

// 创建一个axios实例，设置超时和headers
const apiClient = axios.create({
  timeout: 10000, // 10秒超时
  headers: {
    'Accept': '*/*'
  }
});

const getBaseUrl = () => {
  // 直接调用接口，如果CORS有问题，可以配置代理
  return "https://comment.10jqka.com.cn";
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

const eventsApi = {
  async getEvents(date) {
    try {
      const url = `${getBaseUrl()}/tzrl/getTzrlData.php?callback=callback_dt&type=data&date=${date}`;
      const response = await apiClient.get(url);
      
      // 处理JSONP响应 - 确保转换为字符串
      const responseText = String(response.data);
      console.log('原始响应:', responseText);
      
      // 检查是否是JSONP格式
      if (responseText.startsWith('callback_dt(') && responseText.endsWith(');')) {
        // 提取JSON部分 - 去掉callback_dt(和最后的)
        const jsonStr = responseText.substring(12, responseText.length - 2);
        console.log('提取的JSON字符串:', jsonStr);
        
        try {
          const jsonData = JSON.parse(jsonStr);
          console.log('解析后的数据:', jsonData);
          return { data: jsonData };
        } catch (parseError) {
          console.error('JSON解析错误:', parseError);
          console.log('尝试解析的字符串:', jsonStr);
          throw new Error('响应数据格式错误');
        }
      } else {
        // 尝试直接解析为JSON
        try {
          const jsonData = JSON.parse(responseText);
          return { data: jsonData };
        } catch (parseError) {
          console.error('JSON解析错误:', parseError);
          console.log('原始响应:', responseText);
          throw new Error('响应数据格式错误');
        }
      }
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default eventsApi; 