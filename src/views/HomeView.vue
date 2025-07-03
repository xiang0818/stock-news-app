<template>
    <div class="home">
      <div class="header-section">
        <news-filter 
          :selectedFilter="selectedFilter"
          @filter-changed="handleFilterChange" 
        />
        
        <div class="news-refresh">
          <div class="update-info">
            <span v-if="lastUpdateTime" class="last-update">
              上次更新: {{ lastUpdateTime }}
            </span>
            <span class="keyboard-shortcuts">
              <i class="fas fa-keyboard"></i>
              快捷键: Ctrl+↑/↓ 滚动3个区块
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
        <button @click="scrollToTop" class="floating-top-btn" title="返回顶部">
          <i class="fas fa-arrow-up"></i>
        </button>
      </div>
      
      <loading-spinner v-if="loading" />
      
      <template v-else>
        <news-list
          :newsList="displayedNews"
          :selectedTag="selectedFilter"
          @countdown-update="updateCountdown"
          @refresh-countdown-reset="resetCountdown"
        />
        
        <div v-if="!loading && hasMore" class="load-more-container">
          <button @click="loadMoreNews" class="load-more-btn">
            {{ isLoadingMore ? '加载中...' : '显示更多' }}
          </button>
        </div>
        
        <div v-if="!loading && !hasMore" class="no-more-container">
          <p>没有更多新闻了</p>
        </div>
      </template>

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
        selectedFilter: '21101', // 默认选择"全部"
        loading: true,
        hasMore: true,
        lastUpdateTime: null,
        countdown: 10,
        showToast: false,
        toastMessage: '',
        toastTimeout: null,
        isLoadingMore: false,
        scrollHandler: null
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
      
      // 添加滚动加载事件监听
      this.scrollHandler = this.handleScrollLoad.bind(this);
      window.addEventListener('scroll', this.scrollHandler);
      
      // 添加键盘快捷键监听
      window.addEventListener('keydown', this.handleKeydown);
    },
    beforeDestroy() {
      // 移除滚动事件监听
      window.removeEventListener('scroll', this.handleScroll);
      if (this.scrollHandler) {
        window.removeEventListener('scroll', this.scrollHandler);
      }
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }
      
      // 移除键盘事件监听
      window.removeEventListener('keydown', this.handleKeydown);
    },
    methods: {
      async fetchInitialNews() {
        try {
          this.loading = true;
          
          const response = await newsApi.getInitialNews(this.selectedFilter);
          
          // 验证响应数据结构
          if (!response.data || !response.data.data) {
            this.showToastMessage('服务器返回的数据格式不正确');
            this.loading = false;
            return;
          }
          
          const responseData = response.data.data;
          const list = responseData.list || [];
          const total = responseData.total || 0;
          
          this.allNewsList = list;
          this.displayedNews = list.slice(0, this.displayLimit);
          this.hasMore = this.displayLimit < this.allNewsList.length;
          
          if (list.length === 0) {
            this.showToastMessage('暂无新闻数据');
          }
          
          this.updateLastUpdateTime();
        } catch (error) {
          console.error('获取新闻失败:', error);
          this.showToastMessage(`获取新闻失败: ${error.message || '未知错误'}`);
          // 即使出错也显示空列表，而不是错误消息
          this.allNewsList = [];
          this.displayedNews = [];
          this.hasMore = false;
        } finally {
          this.loading = false;
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
      
      handleScrollLoad() {
        // 如果正在加载或没有更多数据，则不触发加载
        if (this.isLoadingMore || !this.hasMore) return;
        
        // 获取页面底部距离视窗顶部的距离
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;
        
        // 当滚动到距离底部100px时触发加载
        if (scrollHeight - scrollTop - clientHeight < 100) {
          this.loadMoreNews();
        }
      },
      
      async loadMoreNews() {
        // 如果正在加载或没有更多数据，则不触发加载
        if (this.isLoadingMore || !this.hasMore) return;
        
        this.isLoadingMore = true;
        
        try {
          // 增加显示数量
          this.displayLimit += 20;
          this.displayedNews = this.allNewsList.slice(0, this.displayLimit);
          this.hasMore = this.displayLimit < this.allNewsList.length;
        } finally {
          this.isLoadingMore = false;
        }
      },
      
      handleFilterChange(filterId) {
        if (this.selectedFilter === filterId) return;
        
        this.selectedFilter = filterId;
        this.displayLimit = 20;
        this.allNewsList = [];
        this.displayedNews = [];
        this.fetchInitialNews();
      },
      
      refreshNews() {
        this.displayLimit = 20;
        this.allNewsList = [];
        this.displayedNews = [];
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
      
      scrollToTop() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      },
      
      handleScroll() {
        const floatingRefresh = document.querySelector('.floating-refresh');
        if (window.scrollY > 300) {
          floatingRefresh.classList.add('visible');
        } else {
          floatingRefresh.classList.remove('visible');
        }
      },
      
      handleKeydown(event) {
        // 检查是否按下了Ctrl键
        if (!event.ctrlKey) return;
        
        // 阻止默认行为
        event.preventDefault();
        
        if (event.key === 'ArrowUp') {
          // Ctrl + 向上：向上滚动3个新闻区块
          this.scrollByNewsBlocks(-3);
        } else if (event.key === 'ArrowDown') {
          // Ctrl + 向下：向下滚动3个新闻区块
          this.scrollByNewsBlocks(3);
        }
      },
      
      scrollByNewsBlocks(direction) {
        // 获取所有新闻卡片元素
        const newsCards = document.querySelectorAll('.news-card');
        if (newsCards.length === 0) return;
        
        // 计算每个新闻卡片的实际高度（包含padding和margin）
        const cardHeight = 200; // 新闻卡片的实际高度（包含padding 1.5rem * 2 + 内容高度）
        const cardMargin = 16; // 卡片间距
        const totalCardHeight = cardHeight + cardMargin;
        
        // 计算3个区块的总高度
        const blockHeight = totalCardHeight * 3;
        
        // 计算滚动距离
        const scrollDistance = direction * blockHeight;
        
        // 执行平滑滚动
        window.scrollBy({
          top: scrollDistance,
          behavior: 'smooth'
        });
        
        // 显示滚动提示
        const directionText = direction > 0 ? '向下' : '向上';
        this.showToastMessage(`已${directionText}滚动3个新闻区块 (Ctrl+↑/↓ 快捷键)`);
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
    gap: 1rem;
  }
  
  .last-update {
    font-size: 0.9rem;
    color: var(--primary-color);
    font-weight: 500;
  }
  
  .keyboard-shortcuts {
    font-size: 0.85rem;
    color: var(--secondary-color);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: rgba(52, 152, 219, 0.1);
    padding: 4px 8px;
    border-radius: var(--radius-small);
    border: 1px solid rgba(52, 152, 219, 0.2);
  }
  
  .keyboard-shortcuts i {
    font-size: 0.8rem;
  }
  
  /* 暗黑模式下的快捷键提示样式 */
  .dark-theme .keyboard-shortcuts {
    background-color: rgba(31, 184, 226, 0.1);
    color: #e0f4ff;
    border-color: rgba(31, 184, 226, 0.2);
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
    padding: 1rem;
  }
  
  .load-more-btn {
    background-color: var(--light-grey);
    color: var(--dark-color);
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s;
    min-width: 120px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .load-more-btn:hover {
    background-color: #d1d8e0;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .load-more-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .no-more-container {
    text-align: center;
    margin: 2rem 0;
    padding: 1rem;
    color: var(--grey-color);
  }
  
  .no-more-container p {
    font-size: 0.9rem;
    margin: 0;
  }
  
  /* 暗黑模式适配 */
  .dark-theme .load-more-btn {
    background-color: rgba(31, 184, 226, 0.1);
    color: #e0f4ff;
  }
  
  .dark-theme .load-more-btn:hover {
    background-color: rgba(31, 184, 226, 0.2);
    box-shadow: 0 2px 8px rgba(31, 184, 226, 0.2);
  }
  
  .dark-theme .no-more-container {
    color: rgba(255, 255, 255, 0.5);
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
  
  .floating-top-btn {
    background-color: #3498db;
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
  
  .floating-top-btn:hover {
    background-color: #2980b9;
    transform: translateY(-5px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
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
  
  .dark-theme .floating-top-btn {
    background-color: #1f8ede;
    box-shadow: 0 0 10px rgba(31, 142, 222, 0.3);
  }
  
  .dark-theme .floating-top-btn:hover {
    background-color: #1a7bbf;
    box-shadow: 0 0 15px rgba(31, 142, 222, 0.5);
  }
  
  /* 移动端适配 */
  @media (max-width: 767px) {
    .floating-refresh {
      bottom: 20px;
      left: 50%;
      right: auto;
      transform: translateX(-50%);
      flex-direction: row;
      padding: 8px 16px;
      border-radius: 30px;
      gap: 12px;
      background-color: rgba(255, 255, 255, 0.95);
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .floating-countdown {
      order: 2;
    }
    
    .floating-refresh-btn {
      order: 1;
    }
    
    .floating-top-btn {
      order: 3;
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