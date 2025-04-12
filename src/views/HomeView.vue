<template>
    <div class="home">
      <div class="header-section">
        <news-filter 
          :filters="filters" 
          :selectedFilter="selectedFilter"
          @filter-changed="handleFilterChange" 
        />
        
        <div class="news-refresh">
          <div class="update-info">
            <span v-if="lastUpdateTime" class="last-update">
              上次更新: {{ lastUpdateTime }}
            </span>
          </div>
          
          <div class="refresh-controls">
            <div class="countdown-container">
              <svg class="countdown-circle" width="36" height="36" viewBox="0 0 36 36">
                <circle class="countdown-circle-bg" cx="18" cy="18" r="16" />
                <circle 
                  class="countdown-circle-progress" 
                  cx="18" 
                  cy="18" 
                  r="16"
                  :style="circleStyle"
                />
              </svg>
              <span class="countdown-text">{{ countdown }}</span>
            </div>
            <button @click="refreshNews" class="refresh-btn" title="立即刷新">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 悬浮刷新控件 -->
      <div class="floating-refresh">
        <div class="floating-countdown">
          <svg class="countdown-circle" width="36" height="36" viewBox="0 0 36 36">
            <circle class="countdown-circle-bg" cx="18" cy="18" r="16" />
            <circle 
              class="countdown-circle-progress" 
              cx="18" 
              cy="18" 
              r="16"
              :style="circleStyle"
            />
          </svg>
          <span class="countdown-text">{{ countdown }}</span>
        </div>
        <button @click="refreshNews" class="floating-refresh-btn" title="立即刷新">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
      
      <loading-spinner v-if="loading" />
      
      <div v-else-if="errorMessage" class="error-container">
        <div class="error-message">{{ errorMessage }}</div>
        <button @click="refreshNews" class="retry-btn">
          重试
        </button>
      </div>
      
      <template v-else>
        <news-list
          :newsList="displayedNews"
          :selectedTag="selectedFilter"
          @countdown-update="updateCountdown"
          @refresh-countdown-reset="resetCountdown"
        />
        
        <div v-if="!loading && hasMore" class="load-more-container">
          <button @click="loadMoreNews" class="load-more-btn">
            显示更多
          </button>
        </div>
      </template>
    </div>
  </template>
  
  <script>
  import NewsFilter from '@/components/NewsFilter.vue';
  import NewsList from '@/components/NewsList.vue';
  import LoadingSpinner from '@/components/LoadingSpinner.vue';
  import newsApi from '@/services/api';
  
  export default {
    name: 'HomeView',
    components: {
      NewsFilter,
      NewsList,
      LoadingSpinner
    },
    data() {
      return {
        allNewsList: [], // 存储所有获取到的新闻
        displayedNews: [], // 当前显示的新闻
        displayLimit: 20, // 初始显示20条
        filters: [],
        selectedFilter: '21101', // 默认选择"全部"
        loading: true,
        hasMore: true,
        lastUpdateTime: null,
        countdown: 10,
        errorMessage: ''
      };
    },
    computed: {
      circleStyle() {
        const circumference = 2 * Math.PI * 16;
        const progress = this.countdown / 10;
        const dashOffset = circumference * (1 - progress);
        return {
          strokeDasharray: `${circumference}px`,
          strokeDashoffset: `${dashOffset}px`
        };
      }
    },
    created() {
      this.fetchInitialNews();
    },
    mounted() {
      this.fetchInitialNews();
      
      // 监听滚动事件，控制浮动刷新按钮的显示和隐藏
      window.addEventListener('scroll', this.handleScroll);
    },
    beforeDestroy() {
      // 移除滚动事件监听
      window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
      async fetchInitialNews() {
        try {
          this.loading = true;
          this.errorMessage = '';
          
          const response = await newsApi.getInitialNews(this.selectedFilter);
          
          // 验证响应数据结构
          if (!response.data || !response.data.data) {
            this.errorMessage = '服务器返回的数据格式不正确';
            return;
          }
          
          const responseData = response.data.data;
          const list = responseData.list || [];
          const filter = responseData.filter || [];
          const total = responseData.total || 0;
          
          this.allNewsList = list;
          this.displayedNews = list.slice(0, this.displayLimit);
          this.filters = filter.length > 0 ? filter : this.filters;
          this.hasMore = this.displayLimit < this.allNewsList.length;
          
          if (list.length === 0) {
            this.errorMessage = '暂无新闻数据';
          }
          
          this.updateLastUpdateTime();
        } catch (error) {
          console.error('获取新闻失败:', error);
          this.errorMessage = `获取新闻失败: ${error.message || '未知错误'}`;
        } finally {
          this.loading = false;
        }
      },
      
      loadMoreNews() {
        // 不再调用API，只是增加显示数量
        this.displayLimit += 20;
        this.displayedNews = this.allNewsList.slice(0, this.displayLimit);
        this.hasMore = this.displayLimit < this.allNewsList.length;
      },
      
      handleFilterChange(filterId) {
        if (this.selectedFilter === filterId) return;
        
        this.selectedFilter = filterId;
        this.displayLimit = 20;
        this.allNewsList = [];
        this.displayedNews = [];
        this.errorMessage = '';
        this.fetchInitialNews();
      },
      
      refreshNews() {
        this.displayLimit = 20;
        this.allNewsList = [];
        this.displayedNews = [];
        this.errorMessage = '';
        this.fetchInitialNews();
      },
      
      updateLastUpdateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        this.lastUpdateTime = `${hours}:${minutes}`;
      },
      
      updateCountdown(value) {
        this.countdown = value;
      },
      
      resetCountdown() {
        this.countdown = 10;
        this.updateLastUpdateTime();
      },
      
      handleScroll() {
        const floatingRefresh = document.querySelector('.floating-refresh');
        if (window.scrollY > 300) {
          floatingRefresh.classList.add('visible');
        } else {
          floatingRefresh.classList.remove('visible');
        }
      }
    },
    watch: {
      countdown(newVal) {
        // 当倒计时变化时，动画会自动更新
        // 因为circleStyle是计算属性
      }
    }
  };
  </script>
  
  <style scoped>
  .home {
    padding: 2rem 0;
  }
  
  .header-section {
    margin-bottom: 1.5rem;
  }
  
  .news-refresh {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
    padding: 0.8rem 1rem;
    background-color: var(--light-grey);
    border-radius: 8px;
  }
  
  .refresh-controls {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background-color: rgba(255, 255, 255, 0.6);
    padding: 0.3rem 0.5rem;
    border-radius: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .refresh-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s;
  }
  
  .refresh-btn:hover {
    background-color: #c0392b;
    transform: rotate(180deg);
  }
  
  .refresh-btn i {
    font-size: 1rem;
  }
  
  .update-info {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .last-update {
    font-size: 0.9rem;
    color: var(--primary-color);
    font-weight: 500;
  }
  
  .countdown-container {
    position: relative;
    width: 36px;
    height: 36px;
  }
  
  .countdown-circle {
    transform: rotate(-90deg);
  }
  
  .countdown-circle-bg {
    fill: none;
    stroke: #e0e0e0;
    stroke-width: 3;
  }
  
  .countdown-circle-progress {
    fill: none;
    stroke: #f1c40f;
    stroke-width: 3;
    stroke-linecap: round;
    transform-origin: center;
    transition: stroke-dashoffset 0.9s linear;
  }
  
  .countdown-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--primary-color);
  }
  
  .next-refresh {
    display: none;
  }
  
  .error-container {
    text-align: center;
    margin: 2rem 0;
    padding: 2rem;
    background-color: #fff3f3;
    border-radius: 8px;
  }
  
  .error-message {
    color: #e74c3c;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  .retry-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s;
  }
  
  .retry-btn:hover {
    background-color: #c0392b;
  }
  
  .load-more-container {
    text-align: center;
    margin: 2rem 0;
  }
  
  .load-more-btn {
    background-color: var(--light-grey);
    color: var(--dark-color);
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
  }
  
  .load-more-btn:hover {
    background-color: #d1d8e0;
  }
  
  /* 悬浮刷新控件 */
  .floating-refresh {
    position: fixed;
    right: 20px;
    bottom: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 10px;
    border-radius: 20px;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
    z-index: 100;
    transition: all 0.3s;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .floating-countdown {
    position: relative;
    width: 36px;
    height: 36px;
  }
  
  .floating-refresh-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s;
  }
  
  .floating-refresh-btn:hover {
    background-color: #c0392b;
    transform: rotate(180deg);
  }
  
  /* 暗黑模式下的浮动刷新按钮 */
  .dark-theme .floating-refresh {
    background-color: rgba(30, 39, 46, 0.8);
    border-color: rgba(31, 184, 226, 0.3);
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.4);
  }
  
  .dark-theme .floating-refresh-btn {
    background-color: #ff3a4c;
  }
  
  .dark-theme .floating-refresh-btn:hover {
    background-color: #d32f3d;
  }
  
  /* 移动端适配 */
  @media (max-width: 767px) {
    .floating-refresh {
      bottom: 70px;
      right: 15px;
      padding: 8px;
    }
    
    .news-refresh {
      display: none; /* 在移动端隐藏顶部刷新控件 */
    }
  }
  
  /* 在桌面端隐藏浮动刷新按钮，当页面滚动超过一定高度时显示 */
  @media (min-width: 768px) {
    .floating-refresh {
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px);
    }
    
    .floating-refresh.visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
  }
  </style>