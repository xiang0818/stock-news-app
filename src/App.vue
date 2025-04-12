<template>
    <div id="app" :class="{ 'dark-theme': isDarkMode }">
      <theme-background :is-dark-mode="isDarkMode" />
      <header class="header">
        <div class="container header-container">
          <div class="title-section">
            <h1 class="title">股市快讯</h1>
            <p class="subtitle">实时掌握市场动态</p>
          </div>
          <div class="theme-toggle" @click="toggleTheme">
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
            <span>{{ isDarkMode ? '日间模式' : '夜间模式' }}</span>
          </div>
          <div class="header-decoration"></div>
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

<script>
import ThemeBackground from '@/components/ThemeBackground.vue';

export default {
  name: 'App',
  components: {
    ThemeBackground
  },
  data() {
    return {
      isDarkMode: false
    };
  },
  methods: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode);
    }
  },
  mounted() {
    // 从本地存储读取主题设置
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      this.isDarkMode = savedTheme === 'true';
    } else {
      // 默认主题基于系统设置
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode = prefersDark;
    }
  }
};
</script>
  
<style>
@import './assets/css/variables.css';
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap');

body {
  margin: 0;
  padding: 0;
  font-family: 'Noto Sans SC', 'Roboto', sans-serif;
  background-color: var(--bg-primary);
  color: var(--dark-color);
  line-height: 1.6;
  transition: background-color 0.3s, color 0.3s;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  color: var(--primary-color);
  margin-top: 0;
  transition: color 0.3s;
}

a {
  color: var(--secondary-color);
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: var(--primary-color);
}

.container {
  padding: 1rem;
}

.card {
  background-color: var(--bg-card);
  border-radius: var(--radius-small);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.3s, background-color 0.3s;
}

.card:hover {
  box-shadow: var(--shadow-md);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--light-grey);
}

::-webkit-scrollbar-thumb {
  background: var(--grey-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--dark-color);
}

.header {
  background-color: var(--primary-color);
  color: white;
  padding: 2rem 0;
  margin-top: 1rem;
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-large);
  overflow: hidden;
  position: relative;
  transition: background-color 0.3s;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-section {
  flex: 1;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
  position: relative;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all 0.3s;
  z-index: 2;
  margin-right: 1rem;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

.theme-toggle i {
  font-size: 1.2rem;
}

.dark-theme .theme-toggle {
  background-color: rgba(31, 184, 226, 0.3);
  box-shadow: 0 0 10px rgba(31, 184, 226, 0.2);
  border: 1px solid rgba(31, 184, 226, 0.2);
}

.dark-theme .theme-toggle:hover {
  background-color: rgba(31, 184, 226, 0.5);
  box-shadow: 0 0 15px rgba(31, 184, 226, 0.4);
}

.dark-theme .header {
  background: linear-gradient(135deg, #2980b9, #1f3854);
  box-shadow: 0 0 20px rgba(31, 184, 226, 0.15);
}

.dark-theme .footer {
  background: linear-gradient(135deg, #2980b9, #1f3854);
  box-shadow: 0 0 20px rgba(31, 184, 226, 0.15);
}

.header-decoration {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 0;
}

.header::before {
  content: '';
  position: absolute;
  bottom: -30px;
  left: 30%;
  width: 100px;
  height: 100px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.footer {
  background-color: var(--primary-color);
  color: white;
  padding: 1.5rem 0;
  margin-top: 2rem;
  text-align: center;
  border-radius: var(--radius-large);
  transition: background-color 0.3s;
}

/* 暗黑模式过渡效果 */
* {
  transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s;
}
</style>