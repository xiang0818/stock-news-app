<template>
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>
  </template>
  
  <style scoped>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(66, 185, 131, 0.1);
    border-radius: 50%;
    border-top-color: var(--secondary-color);
    animation: spin 1s ease-in-out infinite;
  }
  
  .loading-text {
    margin-top: 1rem;
    color: var(--grey-color);
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  </style>