<template>
    <div class="news-filter">
      <div class="filter-container">
        <button 
          v-for="filter in filters" 
          :key="filter.id"
          class="filter-btn"
          :class="{ 
            active: filter.id === selectedFilter,
            'all': filter.name === '全部',
            'important': filter.name === '重要',
            'a-stock': filter.name === 'A股',
            'hk-stock': filter.name === '港股',
            'us-stock': filter.name === '美股',
            'opportunity': filter.name === '机会',
            'change': filter.name === '异动',
            'announcement': filter.name === '公告'
          }"
          @click="onFilterClick(filter.id)"
        >
          {{ filter.name }}
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NewsFilter',
    props: {
      filters: {
        type: Array,
        default: () => []
      },
      selectedFilter: {
        type: String,
        default: '21101'
      }
    },
    methods: {
      onFilterClick(filterId) {
        this.$emit('filter-changed', filterId);
      }
    }
  };
  </script>
  
  <style scoped>
  .news-filter {
    margin-bottom: 1.5rem;
  }
  
  .filter-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    background-color: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .filter-btn {
    background-color: var(--light-grey);
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s;
  }
  
  .filter-btn:hover {
    background-color: #d1d8e0;
  }
  
  .filter-btn.active {
    color: white;
  }
  
  /* 各类标签按钮的活动状态颜色 */
  .filter-btn.active.all {
    background-color: #3498db; /* 蓝色 */
  }
  
  .filter-btn.active.important {
    background-color: #de1c31; /* 红色 */
  }
  
  .filter-btn.active.a-stock {
    background-color: #ee3f4d; /* 紫色 */
  }
  
  .filter-btn.active.hk-stock {
    background-color: #f39c12; /* 橙色 */
  }
  
  .filter-btn.active.us-stock {
    background-color: #2c3e50; /* 深蓝色 */
  }
  
  .filter-btn.active.opportunity {
    background-color: #8e44ad; /* 深紫色 */
  }
  
  .filter-btn.active.change {
    background-color: #d35400; /* 棕色 */
  }
  
  .filter-btn.active.announcement {
    background-color: #7f8c8d; /* 灰色 */
  }
  </style>