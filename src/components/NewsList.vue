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

      <div v-if="errorMessage" class="error-message">
        <i class="fas fa-exclamation-circle error-icon"></i>
        {{ errorMessage }}
      </div>
      <div v-else class="news-list">
        <transition-group name="news-fade" tag="div" class="single-column">
          <news-card
            v-for="news in displayedNewsList"
            :key="news.id"
            :news="news"
            @show-news-detail="openNewsModal"
          />
        </transition-group>
      </div>
      <div v-if="displayedNewsList.length === 0 && !errorMessage" class="no-news">
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
        currentNewsImportance: 'normal',
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
  
  .error-message {
    text-align: center;
    padding: 1rem;
    background-color: rgba(222, 28, 49, 0.1);
    color: var(--up-color);
    border-radius: var(--radius-medium);
    margin-bottom: 1rem;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: var(--primary-border) solid var(--up-color);
  }
  
  .error-icon {
    margin-right: 0.5rem;
    font-size: 1.2rem;
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
    color: var(--bg-card);
  }
  
  .dark-theme .no-news {
    border-color: #3a3a3a;
  }
  
  .dark-theme .error-message {
    background-color: rgba(222, 28, 49, 0.15);
  }
  </style>