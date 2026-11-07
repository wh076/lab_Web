import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '../stores/user';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import TodoPage from '../pages/TodoPage.vue';
import AboutPage from '../pages/AboutPage.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/todo' },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/todo', component: TodoPage },
    { path: '/about', component: AboutPage },
  ],
});

router.beforeEach(function (to) {
  const userStore = useUserStore();

  if (to.path === '/todo' && !userStore.isLoggedIn) {
    return '/login';
  }
  if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
    return '/todo';
  }
});

export default router;
