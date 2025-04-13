<template>
    <div>
      <div class="search-container">
        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            v-model="searchQuery"
            class="search-input"
            placeholder="搜索新闻标题或内容..."
            @input="handleSearch"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="news-list">
        <transition-group name="news-fade" tag="div" class="single-column">
          <news-card
            v-for="news in displayedNewsList"
            :key="news.id"
            :news="news"
            @show-news-detail="openNewsModal"
          />
        </transition-group>
      </div>
      <div v-if="displayedNewsList.length === 0" class="no-news">
        <i class="fas fa-search no-results-icon"></i>
        <p>没有找到相关新闻</p>
      </div>
      
      <!-- 新闻弹窗 -->
      <news-modal
        :show="showModal"
        :url="currentNewsUrl"
        :title="currentNewsTitle"
        :importance="currentNewsImportance"
        @close="closeModal"
      />

      <!-- Toast提示 -->
      <div class="toast-container" v-if="showToast">
        <div class="toast-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import NewsCard from '@/components/NewsCard.vue';
  import NewsModal from '@/components/NewsModal.vue';
  import newsApi from '@/services/api';
  
  export default {
    name: 'NewsList',
    components: {
      NewsCard,
      NewsModal
    },
    props: {
      newsList: {
        type: Array,
        default: () => []
      },
      selectedTag: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        localNewsList: [],
        refreshInterval: null,
        lastTimestamp: '',
        countdown: 10,
        countdownInterval: null,
        showToast: false,
        toastMessage: '',
        toastTimeout: null,
        showModal: false,
        currentNewsUrl: '',
        currentNewsTitle: '',
        currentNewsImportance: 'normal',
        searchQuery: '',
        filteredNewsList: []
      };
    },
    computed: {
      displayedNewsList() {
        if (this.searchQuery.trim() === '') {
          // 直接返回所有新闻
          return [...this.localNewsList, ...this.newsList];
        } else {
          return this.filteredNewsList;
        }
      },
      countdownText() {
        return `${this.countdown}秒`;
      },
      allNewsList() {
        return [...this.localNewsList, ...this.newsList];
      }
    },
    methods: {
      async fetchLatestNews() {
        try {
          const currentTime = Math.floor(Date.now() / 1000).toString();
          
          if (!this.lastTimestamp && this.newsList.length > 0) {
            // 首次运行，使用列表中最新的文章时间作为基准
            this.lastTimestamp = this.newsList[0]?.ctime || currentTime;
          }
          
          const response = await newsApi.getNews(1, this.selectedTag, this.lastTimestamp);
          
          // 检查响应结构
          if (!response.data || !response.data.data) {
            this.showToastMessage('服务器返回的数据格式不正确');
            return;
          }
          
          const data = response.data.data;
          const newItems = data.list || [];
          
          if (newItems.length > 0) {
            // 更新时间戳为最新的文章时间
            this.lastTimestamp = newItems[0].ctime;
            
            // 将新文章添加到本地列表的前面
            this.localNewsList = [...newItems, ...this.localNewsList];
          }

          // 发送事件通知倒计时重置
          this.$emit('refresh-countdown-reset');
        } catch (error) {
          console.error('自动刷新新闻失败:', error);
          this.showToastMessage(`自动刷新失败: ${error.message || '未知错误'}`);
          // 即使出错也重置倒计时
          this.$emit('countdown-update', 10);
        }
      },
      // 显示Toast提示消息
      showToastMessage(message) {
        this.toastMessage = message;
        this.showToast = true;
        
        // 清除之前的超时
        if (this.toastTimeout) {
          clearTimeout(this.toastTimeout);
        }
        
        // 3秒后自动关闭
        this.toastTimeout = setTimeout(() => {
          this.showToast = false;
        }, 3000);
      },
      startAutoRefresh() {
        // 立即开始倒计时
        this.countdown = 10;
        this.countdownInterval = setInterval(() => {
          this.countdown -= 1;
          if (this.countdown <= 0) {
            this.fetchLatestNews();
            this.countdown = 10;
          }
          // 发送倒计时事件
          this.$emit('countdown-update', this.countdown);
        }, 1000);
        
        // 移除原有的刷新间隔，依靠倒计时触发
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
          this.refreshInterval = null;
        }
      },
      stopAutoRefresh() {
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
          this.refreshInterval = null;
        }
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      },
      openNewsModal(newsData) {
        this.currentNewsTitle = newsData.title;
        this.currentNewsUrl = newsData.url;
        
        // 根据新闻属性判断重要性
        if (newsData.color === '2' || newsData.import === '3') {
          this.currentNewsImportance = 'important';
        } else if (newsData.tags && newsData.tags.some(tag => tag.name === '异动' || tag.name === '警示')) {
          this.currentNewsImportance = 'warning';
        } else {
          this.currentNewsImportance = 'normal';
        }
        
        this.showModal = true;
      },
      closeModal() {
        this.showModal = false;
        this.currentNewsUrl = '';
      },
      handleSearch() {
        const query = this.searchQuery.trim().toLowerCase();
        if (query === '') {
          this.filteredNewsList = [];
          return;
        }
        
        this.filteredNewsList = this.allNewsList.filter(news => {
          const titleMatch = news.title && news.title.toLowerCase().includes(query);
          const digestMatch = news.digest && news.digest.toLowerCase().includes(query);
          return titleMatch || digestMatch;
        });
      },
      clearSearch() {
        this.searchQuery = '';
        this.filteredNewsList = [];
      }
    },
    watch: {
      newsList: {
        handler(newVal) {
          if (newVal.length > 0) {
            this.localNewsList = [];
            if (newVal[0]) {
              this.lastTimestamp = newVal[0].ctime;
            }
          }
        },
        immediate: true
      },
      selectedTag: {
        handler() {
          // 当tag变化时，重置本地列表和时间戳
          this.localNewsList = [];
          this.lastTimestamp = this.newsList[0]?.ctime || '';
        }
      }
    },
    mounted() {
      this.startAutoRefresh();
    },
    beforeDestroy() {
      this.stopAutoRefresh();
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }
    }
  };
  </script>
  
  <style scoped>
  .search-container {
    margin-bottom: 1.5rem;
    position: relative;
  }
  
  .search-wrapper {
    display: flex;
    align-items: center;
    background-color: var(--bg-card);
    border-radius: var(--radius-medium);
    padding: 0 1.2rem;
    box-shadow: var(--shadow-sm);
    border: var(--light-border) solid var(--border-color);
    border-left: var(--secondary-border) solid var(--functional-color);
    transition: all 0.3s;
  }
  
  .search-wrapper:focus-within {
    box-shadow: var(--shadow-md);
    border-color: var(--functional-color);
    transform: translateY(-2px);
  }
  
  .search-icon {
    color: var(--functional-color);
    margin-right: 0.5rem;
    font-size: 1rem;
  }
  
  .search-input {
    flex: 1;
    padding: 0.8rem 0;
    border: none;
    font-size: 1rem;
    outline: none;
    background: transparent;
    color: var(--dark-color);
  }
  
  .clear-button {
    background: none;
    border: none;
    color: var(--grey-color);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s;
  }
  
  .clear-button:hover {
    background-color: var(--light-grey);
    color: var(--functional-color);
  }

  .news-list {
    min-height: 200px;
    position: relative;
  }

  .single-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }
  
  .no-news {
    text-align: center;
    padding: 3rem 0;
    color: var(--grey-color);
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-card);
    border-radius: var(--radius-medium);
    box-shadow: var(--shadow-sm);
    border: var(--light-border) dashed var(--border-color);
  }
  
  .no-results-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
    color: var(--functional-color);
  }
  
  .no-news p {
    font-size: 1.2rem;
    margin: 0;
  }
  
  /* 动画效果 */
  .news-fade-enter-active, .news-fade-leave-active {
    transition: all 0.5s;
  }
  .news-fade-enter, .news-fade-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
  
  /* 暗黑模式适配 */
  .dark-theme .search-input {
    color: #ffffff;
    font-weight: 500;
    letter-spacing: 0.3px;
  }
  
  .dark-theme .search-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .dark-theme .search-wrapper {
    background-color: rgba(31, 184, 226, 0.05);
    border-color: var(--border-color);
    border-left-color: var(--functional-color);
  }
  
  .dark-theme .search-wrapper:focus-within {
    background-color: rgba(31, 184, 226, 0.1);
    box-shadow: 0 0 15px rgba(31, 184, 226, 0.2);
    border-color: var(--functional-color);
    backdrop-filter: blur(2px);
  }
  
  .dark-theme .search-icon {
    color: var(--functional-color);
    font-size: 1.1rem;
    text-shadow: 0 0 5px rgba(31, 184, 226, 0.5);
  }
  
  .dark-theme .clear-button {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .dark-theme .clear-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
  
  .dark-theme .no-news {
    border-color: var(--border-color);
    background-color: rgba(31, 184, 226, 0.05);
  }
  
  .dark-theme .no-news p {
    color: #e0f4ff;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  .dark-theme .no-results-icon {
    color: var(--functional-color);
    text-shadow: 0 0 10px rgba(31, 184, 226, 0.5);
  }
  
  /* Toast样式 */
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    transition: all 0.3s;
    animation: slideIn 0.3s forwards;
  }
  
  .toast-message {
    background-color: rgba(231, 76, 60, 0.9);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 300px;
  }
  
  .toast-message i {
    font-size: 1.2rem;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  /* 暗黑模式下的Toast */
  .dark-theme .toast-message {
    background-color: rgba(255, 82, 82, 0.8);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
  }
  </style>