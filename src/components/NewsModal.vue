<template>
  <transition name="modal">
    <div class="modal-overlay" v-if="show" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header" :class="importanceClass">
          <h3 class="modal-title">
            <i class="fas fa-newspaper title-icon"></i>
            {{ title }}
          </h3>
          <div class="modal-actions">
            <button class="action-button" @click="openInNewWindow" title="在新窗口打开">
              <i class="fas fa-external-link-alt"></i>
            </button>
            <button class="action-button close-button" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="modal-content">
          <div v-if="!url" class="modal-loading">
            <div class="spinner"></div>
            <p>正在加载新闻内容...</p>
          </div>
          <div v-else class="iframe-container">
            <iframe 
              :src="url" 
              class="modal-iframe" 
              frameborder="0"
              ref="newsFrame"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </transition>
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
    },
    importance: {
      type: String,
      default: 'normal' // 可选值: 'normal', 'important', 'warning'
    }
  },
  computed: {
    importanceClass() {
      // 根据重要性返回不同的样式类名
      return {
        'header-important': this.importance === 'important',
        'header-warning': this.importance === 'warning'
      };
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(5px);
}

.modal-container {
  background-color: var(--bg-card);
  border-radius: var(--radius-large);
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: modal-in 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  background-color: var(--functional-color);
  color: white;
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 20%;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

/* 重要新闻的头部样式 */
.modal-header.header-important {
  background-color: var(--up-color);
  background-image: linear-gradient(135deg, var(--up-color), #c0392b);
}

/* 警示新闻的头部样式 */
.modal-header.header-warning {
  background-color: var(--warning-color);
  background-image: linear-gradient(135deg, var(--warning-color), #d35400);
}

.modal-title {
  font-size: 1.2rem;
  margin: 0;
  color: white;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 85%;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
}

.title-icon {
  margin-right: 8px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
  z-index: 2;
}

.action-button {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  cursor: pointer;
  color: white;
  transition: all 0.3s;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.action-button i {
  font-size: 0.9rem;
}

.close-button:hover {
  background: rgba(255, 0, 0, 0.2);
}

.modal-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #ffffff; /* 固定为白色背景，不受夜间模式影响 */
}

.iframe-container {
  height: 70vh;
  background-color: #ffffff; /* 固定白色背景 */
}

.modal-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  background-color: #ffffff;
}

.modal-loading {
  height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--grey-color);
  font-size: 1rem;
  gap: 1rem;
  background-color: white; /* 固定白色背景 */
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--functional-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 动画 */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s;
}

.modal-enter, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗黑模式 */
.dark-theme .modal-overlay {
  background-color: rgba(0, 0, 0, 0.85);
}

.dark-theme .modal-content,
.dark-theme .iframe-container,
.dark-theme .modal-iframe,
.dark-theme .modal-loading {
  background-color: #ffffff !important; /* 确保在暗黑模式下仍然保持白色背景 */
  color: #333333; /* 确保文本颜色在白色背景上可见 */
}

.dark-theme .spinner {
  border-color: rgba(0, 0, 0, 0.1);
  border-left-color: var(--functional-color);
}

/* 移动端适配 */
@media (max-width: 767px) {
  .modal-container {
    max-height: 90vh;
    width: 95%;
  }
  
  .iframe-container,
  .modal-loading {
    height: 60vh;
  }
}
</style> 