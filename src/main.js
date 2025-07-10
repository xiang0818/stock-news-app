import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import VueRouter from 'vue-router';
import HomeView from './views/HomeView.vue';
import EventsView from './views/EventsView.vue';
//
Vue.config.productionTip = false;
Vue.use(VueRouter);

// 引入Font Awesome图标
import '@fortawesome/fontawesome-free/css/all.css';

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/events',
      name: 'events',
      component: EventsView
    }
  ]
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
