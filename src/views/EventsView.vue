<template>
  <div class="events-page">
    <div class="header-section">
      <div class="page-title">
        <h1>股市事件日历</h1>
        <p>重要事件与市场动态</p>
      </div>
      
      <div class="controls">
        <div class="year-selector">
          <button 
            @click="changeYear(-1)" 
            class="year-btn"
            :disabled="currentYear <= minYear"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="current-year">{{ currentYear }}</span>
          <button 
            @click="changeYear(1)" 
            class="year-btn"
            :disabled="currentYear >= maxYear"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="month-selector">
          <button 
            @click="changeMonth(-1)" 
            class="month-btn"
            :disabled="currentMonth <= 1"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="current-month">{{ getMonthName(currentMonth) }}</span>
          <button 
            @click="changeMonth(1)" 
            class="month-btn"
            :disabled="currentMonth >= 12"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <button @click="refreshEvents" class="refresh-btn" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          刷新
        </button>
      </div>
    </div>
    
    <loading-spinner v-if="loading" />
    
    <template v-else>
      <div v-if="events.length === 0" class="no-events">
        <i class="fas fa-calendar-times"></i>
        <p>本月暂无事件数据</p>
      </div>
      
      <div v-else class="events-table-container">
        <table class="events-table">
          <thead>
            <tr>
              <th class="date-column">日期</th>
              <th class="week-column">星期</th>
              <th class="events-column">事件</th>
              <th class="concepts-column">相关概念</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="event in events" 
              :key="event.date"
              class="event-row"
              :class="{ 
                'important': event.import === '1',
                'today': isToday(event.date)
              }"
              :id="`event-${event.date}`"
            >
              <td class="date-cell">
                <div class="date-info">
                  <span class="date-number">{{ formatDate(event.date) }}</span>
                  <span class="month-year">{{ formatMonthYear(event.date) }}</span>
                </div>
              </td>
              <td class="week-cell">
                <span class="week-day">{{ event.week }}</span>
              </td>
              <td class="events-cell">
                <div v-if="event.events && event.events.length > 0" class="events-list">
                  <div 
                    v-for="(eventItem, index) in event.events" 
                    :key="index"
                    class="event-item"
                  >
                    <span
                      class="event-title clickable"
                      @click="openEventModal(eventItem[0])"
                      style="cursor: pointer;"
                    >
                      {{ eventItem[0] }}
                    </span>
                  </div>
                </div>
                <div v-else class="no-events-day">
                  <span>无重要事件</span>
                </div>
              </td>
              <td class="concepts-cell">
                <div v-if="event.concept && event.concept.length > 0" class="concepts-list">
                  <div 
                    v-for="(conceptGroup, groupIndex) in event.concept" 
                    :key="groupIndex"
                    class="concept-group"
                  >
                    <span 
                      v-for="concept in conceptGroup" 
                      :key="concept.code"
                      class="concept-tag"
                    >
                      {{ concept.name }}
                    </span>
                  </div>
                </div>
                <div v-else class="no-concepts">
                  <span>-</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    
    <!-- 悬浮定位按钮 -->
    <div class="floating-today-btn" v-if="hasTodayEvent" @click="scrollToToday">
      <i class="fas fa-calendar-day"></i>
      <span>今天</span>
    </div>
    
    <!-- Toast提示 -->
    <div class="toast-container" v-if="showToast">
      <div class="toast-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ toastMessage }}
      </div>
    </div>
    <NewsModal :show="showModal" :url="modalUrl" :title="modalTitle" @close="closeEventModal" />
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import NewsModal from '@/components/NewsModal.vue';
import eventsApi from '@/services/eventsApi';

export default {
  name: 'EventsView',
  components: {
    LoadingSpinner,
    NewsModal
  },
  data() {
    const now = new Date();
    return {
      events: [],
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1, // getMonth() 返回 0-11，所以需要 +1
      loading: false,
      showToast: false,
      toastMessage: '',
      toastTimeout: null,
      minYear: 2020,
      maxYear: 2026,
      // 弹窗相关
      showModal: false,
      modalUrl: '',
      modalTitle: ''
    };
  },
  computed: {
    formattedDate() {
      const month = this.currentMonth.toString().padStart(2, '0');
      return `${this.currentYear}${month}`;
    },
    
    hasTodayEvent() {
      return this.events.some(event => this.isToday(event.date));
    }
  },
  created() {
    this.fetchEvents();
  },
  mounted() {
    // 从本地存储读取年份和月份，如果没有保存过则使用当前时间
    const savedYear = localStorage.getItem('eventsYear');
    const savedMonth = localStorage.getItem('eventsMonth');
    
    if (savedYear) {
      this.currentYear = parseInt(savedYear);
    }
    if (savedMonth) {
      this.currentMonth = parseInt(savedMonth);
    }
    
    // 确保年份和月份在有效范围内
    if (this.currentYear < this.minYear) {
      this.currentYear = this.minYear;
    }
    if (this.currentYear > this.maxYear) {
      this.currentYear = this.maxYear;
    }
    if (this.currentMonth < 1) {
      this.currentMonth = 1;
    }
    if (this.currentMonth > 12) {
      this.currentMonth = 12;
    }
  },
  methods: {
    async fetchEvents() {
      try {
        this.loading = true;
        const response = await eventsApi.getEvents(this.formattedDate);
        
        if (response.data && response.data.stat === 'ok') {
          this.events = response.data.data || [];
        } else {
          this.events = [];
          this.showToastMessage('获取事件数据失败');
        }
      } catch (error) {
        console.error('获取事件失败:', error);
        this.showToastMessage(`获取事件失败: ${error.message || '未知错误'}`);
        this.events = [];
      } finally {
        this.loading = false;
      }
    },
    
    changeYear(delta) {
      const newYear = this.currentYear + delta;
      if (newYear >= this.minYear && newYear <= this.maxYear) {
        this.currentYear = newYear;
        this.saveSettings();
        this.fetchEvents();
      }
    },
    
    changeMonth(delta) {
      const newMonth = this.currentMonth + delta;
      if (newMonth >= 1 && newMonth <= 12) {
        this.currentMonth = newMonth;
        this.saveSettings();
        this.fetchEvents();
      }
    },
    
    refreshEvents() {
      this.fetchEvents();
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.getDate();
    },
    
    formatMonthYear(dateString) {
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${month}月 ${year}`;
    },
    
    isToday(dateString) {
      const today = new Date();
      const eventDate = new Date(dateString);
      return today.toDateString() === eventDate.toDateString();
    },
    
    getMonthName(month) {
      const months = [
        '一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'
      ];
      return months[month - 1];
    },
    
    saveSettings() {
      localStorage.setItem('eventsYear', this.currentYear.toString());
      localStorage.setItem('eventsMonth', this.currentMonth.toString());
    },
    
    showToastMessage(message) {
      this.toastMessage = message;
      this.showToast = true;
      
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }
      
      this.toastTimeout = setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    openEventModal(eventTitle) {
      this.modalTitle = eventTitle;
      this.modalUrl = `http://www.iwencai.com/unifiedwap/inforesult?querytype=info&qs=fincalendar_ths&w=${encodeURIComponent(eventTitle)}`;
      this.showModal = true;
    },
    closeEventModal() {
      this.showModal = false;
      this.modalUrl = '';
      this.modalTitle = '';
    },
    
    scrollToToday() {
      const todayEvent = this.events.find(event => this.isToday(event.date));
      if (todayEvent) {
        const element = document.getElementById(`event-${todayEvent.date}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // 添加高亮效果
          element.style.animation = 'highlightToday 2s ease-in-out';
          setTimeout(() => {
            element.style.animation = '';
          }, 2000);
        }
      }
    }
  }
};
</script>

<style scoped>
.events-page {
  padding: 1rem 0;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.page-title p {
  margin: 0;
  color: var(--grey-color);
  font-size: 1rem;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.year-selector,
.month-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-card);
  padding: 0.5rem;
  border-radius: var(--radius-small);
  box-shadow: var(--shadow-sm);
}

.year-btn,
.month-btn {
  background: var(--bg-card);
  color: var(--dark-color);
  border: 1px solid var(--light-grey);
  border-radius: var(--radius-small);
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.year-btn:hover:not(:disabled),
.month-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.year-btn:disabled,
.month-btn:disabled {
  background: var(--light-grey);
  color: var(--grey-color);
  border-color: var(--light-grey);
  cursor: not-allowed;
}

.current-year,
.current-month {
  font-weight: 600;
  color: var(--primary-color);
  min-width: 60px;
  text-align: center;
}

.refresh-btn {
  background: var(--bg-card);
  color: var(--dark-color);
  border: 1px solid var(--light-grey);
  border-radius: var(--radius-small);
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.refresh-btn:disabled {
  background: var(--light-grey);
  color: var(--grey-color);
  border-color: var(--light-grey);
  cursor: not-allowed;
}

.no-events {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--grey-color);
}

.no-events i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.events-table-container {
  overflow-x: auto;
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-sm);
  background: var(--bg-card);
}

.events-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  border: 2px solid var(--grey-color);
}

.events-table th,
.events-table td {
  border: 2px solid var(--light-grey);
}

.events-table th {
  background: var(--light-grey);
  color: var(--dark-color);
  font-weight: 600;
  padding: 1rem 0.75rem;
  text-align: left;
  border-bottom: 3px solid var(--grey-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.events-table td {
  padding: 1rem 0.75rem;
  border-bottom: 2px solid var(--light-grey);
  vertical-align: top;
}

.events-table {
  border: 2px solid var(--grey-color);
}

.event-row {
  transition: background-color 0.2s;
}

.event-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.event-row.important {
  background-color: rgba(255, 193, 7, 0.05);
}

.event-row.important:hover {
  background-color: rgba(255, 193, 7, 0.1);
}

.event-row.today {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 4px solid var(--primary-color);
}

.event-row.today:hover {
  background-color: rgba(76, 175, 80, 0.15);
}

.event-row.today .date-number {
  color: var(--primary-color);
  font-weight: 800;
}

.event-row.today .week-day {
  color: var(--primary-color);
  font-weight: 600;
}

@keyframes highlightToday {
  0%, 100% {
    background-color: rgba(76, 175, 80, 0.1);
  }
  50% {
    background-color: rgba(76, 175, 80, 0.3);
  }
}

.date-column {
  width: 120px;
}

.week-column {
  width: 80px;
}

.events-column {
  min-width: 300px;
}

.concepts-column {
  min-width: 200px;
}

.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.date-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.month-year {
  font-size: 0.75rem;
  color: var(--grey-color);
  font-weight: 500;
}

.week-day {
  font-size: 0.875rem;
  color: var(--grey-color);
  font-weight: 500;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--light-grey);
}

.event-item:last-child {
  border-bottom: none;
}

.event-title {
  font-weight: 500;
  color: var(--dark-color);
  line-height: 1.4;
  display: block;
}

.event-title.clickable {
  cursor: pointer !important;
  color: var(--dark-color);
  text-decoration: none;
  transition: color 0.2s, text-decoration 0.2s;
}

.event-title.clickable:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.concepts-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.concept-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.concept-tag {
  background: var(--secondary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-small);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.no-events-day,
.no-concepts {
  color: var(--grey-color);
  font-style: italic;
  font-size: 0.875rem;
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.toast-message {
  background: var(--bg-card);
  color: var(--dark-color);
  padding: 1rem;
  border-radius: var(--radius-small);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls {
    justify-content: center;
  }
  
  .event-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .event-importance {
    align-self: center;
  }
}

.floating-today-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-pill);
  padding: 0.75rem 1rem;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s;
  z-index: 100;
}

.floating-today-btn:hover {
  background: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.floating-today-btn i {
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-today-btn {
    bottom: 1rem;
    right: 1rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style> 