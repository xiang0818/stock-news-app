<template>
    <div>
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          class="search-input"
          placeholder="搜索新闻标题或内容..."
          @input="handleSearch"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-button">
          清除
        </button>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-else class="single-column">
        <news-card
          v-for="news in displayedNewsList"
          :key="news.id"
          :news="news"
          @show-news-detail="openNewsModal"
        />
      </div>
      <div v-if="displayedNewsList.length === 0 && !errorMessage" class="no-news">
        没有找到相关新闻
      </div>
      
      <!-- 新闻弹窗 -->
      <news-modal
        :show="showModal"
        :url="currentNewsUrl"
        :title="currentNewsTitle"
        @close="closeModal"
      />
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
        errorMessage: '',
        showModal: false,
        currentNewsUrl: '',
        currentNewsTitle: '',
        searchQuery: '',
        filteredNewsList: []
      };
    },
    computed: {
      displayedNewsList() {
        if (this.searchQuery.trim() === '') {
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
          this.errorMessage = '';
          const currentTime = Math.floor(Date.now() / 1000).toString();
          
          if (!this.lastTimestamp && this.newsList.length > 0) {
            // 首次运行，使用列表中最新的文章时间作为基准
            this.lastTimestamp = this.newsList[0]?.ctime || currentTime;
          }
          
          const response = await newsApi.getNews(1, this.selectedTag, this.lastTimestamp);
          
          // 检查响应结构
          if (!response.data || !response.data.data) {
            this.errorMessage = '服务器返回的数据格式不正确';
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
          this.errorMessage = `自动刷新失败: ${error.message || '未知错误'}`;
          // 即使出错也重置倒计时
          this.$emit('countdown-update', 10);
        }
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
      resetError() {
        this.errorMessage = '';
      },
      openNewsModal(newsData) {
        this.currentNewsTitle = newsData.title;
        this.currentNewsUrl = newsData.url;
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
          this.resetError();
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
          this.resetError();
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
    }
  };
  </script>
  
  <style scoped>
  .search-container {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
  }
  
  .search-input {
    flex: 1;
    padding: 0.8rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s;
  }
  
  .search-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
  }
  
  .clear-button {
    margin-left: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    background-color: var(--light-grey);
    color: var(--dark-color);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s;
  }
  
  .clear-button:hover {
    background-color: #e0e0e0;
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
    font-size: 1.2rem;
    color: var(--grey-color);
    width: 100%;
  }
  
  .error-message {
    text-align: center;
    padding: 1rem;
    background-color: #fff3f3;
    color: #e74c3c;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 1rem;
  }
  </style>