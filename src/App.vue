<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user';
import ThemeToggle from './components/ThemeToggle.vue';

function loadTheme() {
  try {
    if (localStorage.getItem('theme') === 'dark') {
      return 'dark';
    }
  } catch (error) {
    return 'light';
  }
  return 'light';
}

const router = useRouter();
const userStore = useUserStore();
const theme = ref(loadTheme());

watch(
  theme,
  function (value) {
    document.documentElement.setAttribute('data-theme', value);
    localStorage.setItem('theme', value);
  },
  { immediate: true }
);

function toggleTheme() {
  if (theme.value === 'dark') {
    theme.value = 'light';
  } else {
    theme.value = 'dark';
  }
}

function logout() {
  userStore.logout();
  router.push('/login');
}
</script>

<template>
  <header class="header">
    <div class="header__inner container">
      <span class="header__title">To-Do</span>

      <nav class="nav" aria-label="Основная навигация">
        <RouterLink v-if="userStore.isLoggedIn" class="nav__link" to="/todo">Задачи</RouterLink>
        <RouterLink v-if="!userStore.isLoggedIn" class="nav__link" to="/login">Вход</RouterLink>
        <RouterLink v-if="!userStore.isLoggedIn" class="nav__link" to="/register">Регистрация</RouterLink>
        <RouterLink class="nav__link" to="/about">О приложении</RouterLink>
      </nav>

      <div v-if="userStore.isLoggedIn" class="header__user">
        <span class="header__email">{{ userStore.currentUser.email }}</span>
        <button type="button" class="button" @click="logout">Выйти</button>
      </div>

      <ThemeToggle :theme="theme" @toggle="toggleTheme" />
    </div>
  </header>

  <main class="main container">
    <RouterView />
  </main>
</template>
