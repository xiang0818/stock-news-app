<template>
  <div class="theme-background" :class="{ 'dark-theme': isDarkMode }"></div>
</template>

<script>
export default {
  name: 'ThemeBackground',
  props: {
    isDarkMode: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.theme-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -100;
  background-color: var(--bg-primary);
  transition: background-color 0.3s;
}
</style> 