<template>
    <div id="app">
      <header class="header">
        <div class="container">
          <h1 class="title">股市快讯</h1>
          <p class="subtitle">实时掌握市场动态</p>
        </div>
      </header>
      <main class="container">
        <router-view />
      </main>
      <footer class="footer">
        <div class="container">
          <p>&copy; 2025 股市快讯 - 提供最新股市资讯</p>
        </div>
      </footer>
    </div>
</template>
  
  <style>
  :root {
    --primary-color: #2c3e50;
    --secondary-color: #42b983;
    --accent-color: #e74c3c;
    --light-color: #f8f9fa;
    --dark-color: #343a40;
    --grey-color: #6c757d;
    --light-grey: #ecf0f1;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: var(--dark-color);
    background-color: var(--light-color);
  }
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
  }
  
  .header {
    background-color: var(--primary-color);
    color: white;
    padding: 2rem 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .footer {
    background-color: var(--primary-color);
    color: white;
    padding: 1.5rem 0;
    margin-top: 2rem;
    text-align: center;
  }
  </style>