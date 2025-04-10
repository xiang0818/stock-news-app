<template>
  <div class="modal-overlay" v-if="show" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <div class="modal-actions">
          <button class="open-new-window-button" @click="openInNewWindow" title="在新窗口打开">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
      </div>
      <div class="modal-content">
        <iframe 
          v-if="url" 
          :src="url" 
          class="modal-iframe" 
          frameborder="0"
          ref="newsFrame"
        ></iframe>
        <div v-else class="modal-loading">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '新闻详情'
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    openInNewWindow() {
      if (this.url) {
        window.open(this.url, '_blank');
      }
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // 当弹窗显示时，禁止页面滚动
        document.body.style.overflow = 'hidden';
      } else {
        // 当弹窗关闭时，恢复页面滚动
        document.body.style.overflow = '';
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--light-grey);
}

.modal-title {
  font-size: 1.2rem;
  margin: 0;
  color: var(--primary-color);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 85%;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.open-new-window-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--grey-color);
  transition: color 0.3s;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.open-new-window-button:hover {
  color: var(--accent-color);
  background-color: rgba(0, 0, 0, 0.05);
}

.open-new-window-button svg {
  width: 16px;
  height: 16px;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--grey-color);
  transition: color 0.3s;
}

.close-button:hover {
  color: var(--accent-color);
}

.modal-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.modal-iframe {
  width: 100%;
  height: 70vh;
  border: 0;
}

.modal-loading {
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--grey-color);
  font-size: 1.2rem;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .modal-container {
    max-height: 90vh;
    width: 95%;
  }
  
  .modal-iframe {
    height: 60vh;
  }
}
</style> 