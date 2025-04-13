<template>
    <div class="news-filter">
      <h2 class="filter-title">股票热点消息<span class="filter-subtitle">实时热点跟踪</span></h2>
      <div class="filter-container">
        <button 
          v-for="filter in fixedFilters" 
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
          <span class="filter-icon" v-if="filter.name === '全部'">
            <i class="fas fa-globe"></i>
          </span>
          <span class="filter-icon" v-else-if="filter.name === '重要'">
            <i class="fas fa-star"></i>
          </span>
          <span class="filter-icon" v-else-if="filter.name === 'A股'">
            <i class="fas fa-landmark"></i>
          </span>
          <span class="filter-icon" v-else-if="filter.name === '港股'">
            <i class="fas fa-building"></i>
          </span>
          <span class="filter-icon" v-else-if="filter.name === '美股'">
            <i class="fas fa-flag-usa"></i>
          </span>
          <span class="filter-icon" v-else-if="filter.name === '机会'">
            <i class="fas fa-lightbulb"></i>
          </span>
          <span class="filter-icon" v-else-if="filter.name === '异动'">
            <i class="fas fa-bolt"></i>
          </span>
          <span class="filter-icon" v-else-if="filter.name === '公告'">
            <i class="fas fa-bullhorn"></i>
          </span>
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
    data() {
      return {
        // 固定显示的标签，不依赖接口返回
        fixedFilters: [
          {
            "id": "21101",
            "name": "全部",
            "bury": "all"
          },
          {
            "id": "-21101",
            "name": "重要",
            "bury": "zy"
          },
          {
            "id": "21103",
            "name": "A股",
            "bury": "ag"
          },
          {
            "id": "21105",
            "name": "港股",
            "bury": "gg"
          },
          {
            "id": "21107",
            "name": "美股",
            "bury": "mg"
          },
          {
            "id": "21109",
            "name": "机会",
            "bury": "jh"
          },
          {
            "id": "21111",
            "name": "异动",
            "bury": "yd"
          },
          {
            "id": "34843",
            "name": "公告",
            "bury": "34843"
          }
        ]
      };
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
    margin-bottom: 2rem;
    position: relative;
  }
  
  .filter-title {
    font-size: 1.6rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
    font-weight: 700;
    position: relative;
    padding-bottom: 0.5rem;
    padding-left: var(--primary-border);
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .filter-subtitle {
    font-size: 1rem;
    color: var(--functional-color);
    font-weight: 500;
    padding: 3px 10px;
    background-color: rgba(26, 148, 188, 0.1);
    border-radius: var(--radius-small);
  }
  
  .filter-title:before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: var(--primary-border);
    background-color: var(--up-color);
    border-radius: 2px;
  }
  
  .filter-title:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 55px;
    width: 100px;
    height: var(--light-border);
    background-color: var(--functional-color);
    border-radius: 2px;
  }
  
  .filter-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    background-color: var(--bg-card);
    padding: 1.2rem;
    border-radius: var(--radius-medium);
    box-shadow: var(--shadow-sm);
    border-top: var(--light-border) solid var(--border-color);
    border-left: var(--light-border) solid var(--border-color);
  }
  
  .filter-btn {
    background-color: var(--light-grey);
    border: none;
    border-radius: var(--radius-small);
    padding: 8px 16px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    font-weight: 500;
    border: var(--light-border) solid transparent;
    position: relative;
    overflow: hidden;
  }
  
  .filter-icon {
    margin-right: 6px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
  }
  
  .filter-btn:hover {
    background-color: #e3e8ed;
    transform: translateY(-2px);
    border-color: var(--border-color);
    box-shadow: var(--shadow-sm);
  }
  
  .filter-btn.active {
    color: white;
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border: none;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .filter-btn:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .filter-btn:hover:after,
  .filter-btn.active:after {
    opacity: 1;
  }
  
  /* 各类标签按钮的活动状态颜色 */
  .filter-btn.active.all {
    background-color: var(--functional-color);
  }
  
  .filter-btn.active.important {
    background-color: var(--up-color);
  }
  
  .filter-btn.active.a-stock {
    background-color: #ee3f4d;
  }
  
  .filter-btn.active.hk-stock {
    background-color: #f39c12;
  }
  
  .filter-btn.active.us-stock {
    background-color: #2c3e50;
  }
  
  .filter-btn.active.opportunity {
    background-color: #8e44ad;
  }
  
  .filter-btn.active.change {
    background-color: #d35400;
  }
  
  .filter-btn.active.announcement {
    background-color: #7f8c8d;
  }
  
  /* 暗黑模式适配 */
  .dark-theme .filter-container {
    border-color: var(--border-color);
    box-shadow: 0 0 15px rgba(31, 184, 226, 0.05);
  }
  
  .dark-theme .filter-title {
    color: #ffffff;
  }
  
  .dark-theme .filter-subtitle {
    background-color: rgba(31, 184, 226, 0.2);
    color: #e0f4ff;
  }
  
  .dark-theme .filter-btn {
    background-color: rgba(31, 184, 226, 0.05);
    color: #e0f4ff;
    border-color: rgba(31, 184, 226, 0.1);
  }
  
  .dark-theme .filter-btn:hover {
    background-color: rgba(31, 184, 226, 0.1);
    box-shadow: 0 0 10px rgba(31, 184, 226, 0.1);
  }
  
  .dark-theme .filter-btn.active {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    letter-spacing: 0.5px;
  }
  
  /* 暗黑模式下的按钮颜色调整 */
  .dark-theme .filter-btn.active.all {
    background-color: #38b0de;
  }
  
  .dark-theme .filter-btn.active.important {
    background-color: #ff3a4c;
  }
  
  .dark-theme .filter-btn.active.a-stock {
    background-color: #ff5b69;
  }
  
  .dark-theme .filter-btn.active.hk-stock {
    background-color: #ffb347;
  }
  
  .dark-theme .filter-btn.active.us-stock {
    background-color: #34495e;
  }
  
  .dark-theme .filter-btn.active.opportunity {
    background-color: #9b59b6;
  }
  
  .dark-theme .filter-btn.active.change {
    background-color: #e67e22;
  }
  
  .dark-theme .filter-btn.active.announcement {
    background-color: #95a5a6;
  }
  </style>