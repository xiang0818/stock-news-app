<template>
    <div class="news-filter">
      <div class="filter-container">
        <button 
          v-for="filter in filters" 
          :key="filter.id"
          class="filter-btn"
          :class="{ active: filter.id === selectedFilter }"
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
    background-color: var(--secondary-color);
    color: white;
  }
  </style>