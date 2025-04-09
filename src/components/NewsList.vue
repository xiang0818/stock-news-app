<template>
    <div>
      <div class="single-column">
        <news-card
          v-for="news in displayedNewsList"
          :key="news.id"
          :news="news"
        />
      </div>
      <div v-if="displayedNewsList.length === 0" class="no-news">
        没有找到相关新闻
      </div>
    </div>
  </template>
  
  <script>
  import NewsCard from '@/components/NewsCard.vue';
  import newsApi from '@/services/api';
  
  export default {
    name: 'NewsList',
    components: {
      NewsCard
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
        countdownInterval: null
      };
    },
    computed: {
      displayedNewsList() {
        return [...this.localNewsList, ...this.newsList];
      },
      countdownText() {
        return `${this.countdown}秒`;
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
          const newItems = response.data.data.list || [];
          
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
        }
      },
      startAutoRefresh() {
        // 立即开始倒计时
        this.countdown = 10;
        this.countdownInterval = setInterval(() => {
          this.countdown -= 1;
          if (this.countdown <= 0) {
            this.countdown = 10;
          }
          // 发送倒计时事件
          this.$emit('countdown-update', this.countdown);
        }, 1000);
        
        // 设置刷新间隔
        this.refreshInterval = setInterval(() => {
          this.fetchLatestNews();
        }, 10000);
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
    }
  };
  </script>
  
  <style scoped>
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
  </style>