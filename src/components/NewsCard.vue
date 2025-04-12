<template>
    <div class="news-card" :class="{'important': isImportant}" @click="showNewsDetail">
      <div class="news-header">
        <div class="news-tags">
          <span 
            v-for="tag in parsedTags" 
            :key="tag.id"
            class="news-tag"
          >
            {{ tag.name }}
          </span>
        </div>
        <time class="news-time">
          <i class="far fa-clock time-icon"></i>
          {{ formattedTime }}
        </time>
      </div>
      
      <h3 class="news-title">{{ news.title }}</h3>
      
      <p class="news-digest">{{ news.digest }}</p>
      
      <div class="news-footer">
        <div class="news-stocks" v-if="news.stock && news.stock.length">
          <span 
            v-for="stock in news.stock.slice(0, 3)" 
            :key="stock.stockCode"
            class="news-stock"
          >
            <i class="fas fa-chart-line stock-icon"></i>
            {{ stock.name }}
          </span>
          <span v-if="news.stock.length > 3" class="news-stock-more">
            +{{ news.stock.length - 3 }}
          </span>
        </div>
        <div class="news-view">
          <i class="fas fa-external-link-alt view-icon"></i>
          查看详情
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NewsCard',
    props: {
      news: {
        type: Object,
        required: true
      }
    },
    computed: {
      isImportant() {
        return this.news.color === '2' || this.news.import === '3';
      },
      parsedTags() {
        return this.news.tags || [];
      },
      formattedTime() {
        const timestamp = parseInt(this.news.ctime) * 1000;
        const date = new Date(timestamp);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${month}-${day} ${hours}:${minutes}`;
      }
    },
    methods: {
      showNewsDetail() {
        // 发送事件给父组件，传递新闻标题和URL
        this.$emit('show-news-detail', {
          title: this.news.title,
          url: this.news.url
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .news-card {
    background-color: var(--bg-card);
    border-radius: var(--radius-medium);
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s;
    cursor: pointer;
    border-top: var(--light-border) solid var(--border-color);
    border-left: var(--light-border) solid var(--border-color);
    position: relative;
    overflow: hidden;
  }
  
  .news-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    border-color: var(--functional-color);
  }
  
  .news-card.important {
    border-left: var(--primary-border) solid var(--up-color);
    position: relative;
    overflow: hidden;
  }
  
  .news-card.important::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 30px 30px 0;
    border-color: transparent var(--up-color) transparent transparent;
    z-index: 1;
  }
  
  .news-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px dashed var(--border-color);
  }
  
  .news-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .news-tag {
    background-color: var(--bg-secondary);
    color: var(--primary-color);
    font-size: 0.8rem;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    font-weight: 500;
    transition: all 0.3s;
  }
  
  .news-tag:hover {
    background-color: var(--secondary-color);
    color: white;
    transform: translateY(-2px);
  }
  
  .news-time {
    font-size: 0.85rem;
    color: var(--grey-color);
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.03);
    padding: 3px 8px;
    border-radius: var(--radius-small);
  }
  
  .time-icon {
    margin-right: 4px;
    font-size: 0.8rem;
  }
  
  .news-title {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: var(--primary-color);
    font-weight: 600;
    padding-left: 0.3rem;
    border-left: var(--secondary-border) solid var(--functional-color);
  }
  
  .news-digest {
    color: var(--dark-color);
    font-size: 0.95rem;
    margin-bottom: 1.2rem;
    max-height: 120px;
    overflow-y: auto;
    line-height: 1.6;
    opacity: 0.85;
    padding: 0.6rem;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: var(--radius-small);
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    transition: scrollbar-color 0.3s;
  }
  
  .news-digest::-webkit-scrollbar {
    width: 4px;
  }
  
  .news-digest::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .news-digest::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 4px;
  }
  
  .news-digest:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  .news-digest:hover {
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }
  
  .dark-theme .news-digest:hover::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .dark-theme .news-digest:hover {
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }
  
  .news-footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.8rem;
    border-top: 1px dashed var(--border-color);
  }
  
  .news-stocks {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .news-stock {
    background-color: rgba(52, 152, 219, 0.1);
    color: var(--secondary-color);
    font-size: 0.8rem;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }
  
  .news-stock:hover {
    background-color: rgba(52, 152, 219, 0.2);
    transform: translateY(-2px);
  }
  
  .stock-icon {
    margin-right: 4px;
    font-size: 0.75rem;
  }
  
  .news-stock-more {
    font-size: 0.8rem;
    color: var(--grey-color);
    margin-left: 4px;
  }
  
  .news-view {
    font-size: 0.85rem;
    color: var(--functional-color);
    display: flex;
    align-items: center;
    transition: all 0.3s;
    background-color: rgba(26, 148, 188, 0.1);
    padding: 5px 10px;
    border-radius: var(--radius-small);
  }
  
  .view-icon {
    margin-right: 4px;
    font-size: 0.8rem;
  }
  
  .news-card:hover .news-view {
    background-color: var(--functional-color);
    color: white;
  }
  
  /* 晚间模式下的适配 */
  .dark-theme .news-card {
    border-color: #3a3a3a;
  }
  
  .dark-theme .news-header,
  .dark-theme .news-footer {
    border-color: #3a3a3a;
  }
  
  .dark-theme .news-digest {
    background-color: rgba(255, 255, 255, 0.03);
  }
  </style>
  