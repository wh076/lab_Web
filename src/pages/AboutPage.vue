<script setup>
import { useUserStore } from '../stores/user';
import { useTodoStore } from '../stores/todo';

const userStore = useUserStore();
const todoStore = useTodoStore();
</script>

<template>
  <div class="about">
    <h1 class="page-title">О приложении</h1>

    <section class="about__section">
      <h2 class="about__title">Что это</h2>
      <p class="about__text">
        Простой список задач. Можно зарегистрироваться, войти и вести свои задачи: добавлять,
        редактировать, удалять, отмечать выполненные и искать по названию. У каждого пользователя
        свой список. Всё хранится в этом браузере, сервера нет.
      </p>
    </section>

    <section class="about__section">
      <h2 class="about__title">Стек</h2>
      <ul class="about__list">
        <li>Vue 3</li>
        <li>Vite</li>
        <li>Pinia</li>
        <li>Vue Router</li>
        <li>Sass</li>
      </ul>
    </section>

    <section class="about__section">
      <h2 class="about__title">Статистика в этом браузере</h2>
      <dl class="stats">
        <div class="stats__item">
          <dt>Пользователей</dt>
          <dd class="stats__value">{{ userStore.users.length }}</dd>
        </div>
        <div class="stats__item">
          <dt>Всего задач</dt>
          <dd class="stats__value">{{ todoStore.tasks.length }}</dd>
        </div>
        <div v-if="userStore.isLoggedIn" class="stats__item">
          <dt>Ваших задач</dt>
          <dd class="stats__value">{{ todoStore.currentTasks.length }}</dd>
        </div>
      </dl>
    </section>

    <section class="about__section">
      <h2 class="about__title">История лабораторных</h2>
      <ul class="about__list">
        <li>№4: To-Do на HTML, Sass и JavaScript без фреймворков.</li>
        <li>№5: знакомство с Vue 3, небольшие задачи на Options API и Composition API.</li>
        <li>№6: To-Do перенесён на Vue 3 и Vite, появились компоненты и публикация на GitHub Pages.</li>
        <li>№7: добавлены Pinia, Vue Router, регистрация и вход, у каждого пользователя свои задачи.</li>
      </ul>
    </section>
  </div>
</template>
