<template>
    <div class="news-card" :class="{'important': isImportant}" @click="openNews">
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
        <time class="news-time">{{ formattedTime }}</time>
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
            {{ stock.name }}
          </span>
          <span v-if="news.stock.length > 3" class="news-stock-more">
            +{{ news.stock.length - 3 }}
          </span>
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
      openNews() {
        window.open(this.news.url, '_blank');
      }
    }
  };
  </script>
  
  <style scoped>
  .news-card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
  }
  
  .news-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  .news-card.important {
    border-left: 4px solid var(--accent-color);
  }
  
  .news-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .news-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .news-tag {
    background-color: var(--light-grey);
    color: var(--primary-color);
    font-size: 0.8rem;
    padding: 2px 8px;
    border-radius: 4px;
  }
  
  .news-time {
    font-size: 0.8rem;
    color: var(--grey-color);
  }
  
  .news-title {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .news-digest {
    color: var(--grey-color);
    font-size: 0.95rem;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .news-footer {
    margin-top: auto;
  }
  
  .news-stocks {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .news-stock {
    background-color: rgba(66, 185, 131, 0.1);
    color: var(--secondary-color);
    font-size: 0.8rem;
    padding: 2px 8px;
    border-radius: 4px;
  }
  
  .news-stock-more {
    font-size: 0.8rem;
    color: var(--grey-color);
  }
  </style>
  