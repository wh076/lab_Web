<script setup>
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

const email = ref('');
const password = ref('');
const confirm = ref('');
const errorField = ref('');
const errorText = ref('');

async function onSubmit() {
  const error = userStore.register(email.value, password.value, confirm.value);

  if (error === null) {
    router.push({ path: '/login', query: { registered: '1' } });
    return;
  }

  errorField.value = error.field;
  errorText.value = error.message;
  await nextTick();
  document.getElementById('register-' + error.field).focus();
}
</script>

<template>
  <div class="form-page">
    <h1 class="page-title">Регистрация</h1>

    <form class="form" novalidate @submit.prevent="onSubmit">
      <div>
        <label for="register-email" class="form__label">Email</label>
        <input
          v-model="email"
          type="email"
          id="register-email"
          class="form__input"
          autocomplete="email"
          required
          :aria-invalid="errorField === 'email'"
          :aria-describedby="errorField === 'email' ? 'register-error' : undefined"
        >
      </div>

      <div>
        <label for="register-password" class="form__label">Пароль</label>
        <input
          v-model="password"
          type="password"
          id="register-password"
          class="form__input"
          autocomplete="new-password"
          required
          :aria-invalid="errorField === 'password'"
          :aria-describedby="errorField === 'password' ? 'register-error' : undefined"
        >
      </div>

      <div>
        <label for="register-confirm" class="form__label">Подтверждение пароля</label>
        <input
          v-model="confirm"
          type="password"
          id="register-confirm"
          class="form__input"
          autocomplete="new-password"
          required
          :aria-invalid="errorField === 'confirm'"
          :aria-describedby="errorField === 'confirm' ? 'register-error' : undefined"
        >
      </div>

      <p v-if="errorText" id="register-error" class="form__error" role="alert">{{ errorText }}</p>

      <button type="submit" class="button button--primary">Зарегистрироваться</button>
    </form>

    <p class="form-page__link">Уже есть аккаунт? <RouterLink class="link" to="/login">Войти</RouterLink></p>
  </div>
</template>
