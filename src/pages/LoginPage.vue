<script setup>
import { ref, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const email = ref('');
const password = ref('');
const errorText = ref('');

async function onSubmit() {
  errorText.value = userStore.login(email.value, password.value);

  if (errorText.value === '') {
    router.push('/todo');
    return;
  }

  await nextTick();
  document.getElementById('login-email').focus();
}
</script>

<template>
  <div class="form-page">
    <h1 class="page-title">Вход</h1>

    <p v-if="route.query.registered" class="form__success" role="status">Регистрация прошла успешно, теперь можно войти</p>

    <form class="form" novalidate @submit.prevent="onSubmit">
      <div>
        <label for="login-email" class="form__label">Email</label>
        <input
          v-model="email"
          type="email"
          id="login-email"
          class="form__input"
          autocomplete="email"
          required
          :aria-invalid="errorText !== ''"
          :aria-describedby="errorText !== '' ? 'login-error' : undefined"
        >
      </div>

      <div>
        <label for="login-password" class="form__label">Пароль</label>
        <input
          v-model="password"
          type="password"
          id="login-password"
          class="form__input"
          autocomplete="current-password"
          required
          :aria-invalid="errorText !== ''"
          :aria-describedby="errorText !== '' ? 'login-error' : undefined"
        >
      </div>

      <p v-if="errorText" id="login-error" class="form__error" role="alert">{{ errorText }}</p>

      <button type="submit" class="button button--primary">Войти</button>
    </form>

    <p class="form-page__link">Нет аккаунта? <RouterLink class="link" to="/register">Зарегистрироваться</RouterLink></p>
  </div>
</template>
