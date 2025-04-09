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
            <span class="next-refresh">
              下次刷新: {{ countdown }}秒
            </span>
          </div>
          <button @click="refreshNews" class="refresh-btn">
            <i class="fas fa-sync-alt"></i> 立即刷新
          </button>
        </div>
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
        countdown: 10
      };
    },
    created() {
      this.fetchInitialNews();
    },
    methods: {
      async fetchInitialNews() {
        try {
          this.loading = true;
          const response = await newsApi.getInitialNews(this.selectedFilter);
          const { list, filter, total } = response.data.data;
          
          this.allNewsList = list;
          this.displayedNews = list.slice(0, this.displayLimit);
          this.filters = filter;
          this.hasMore = this.displayLimit < this.allNewsList.length;
          
          this.updateLastUpdateTime();
        } catch (error) {
          console.error('获取新闻失败:', error);
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
  
  .refresh-btn {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background-color 0.3s;
  }
  
  .refresh-btn:hover {
    background-color: #3aa876;
  }
  
  .update-info {
    display: flex;
    gap: 1.5rem;
  }
  
  .last-update, .next-refresh {
    font-size: 0.9rem;
    color: var(--primary-color);
    font-weight: 500;
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
  </style>