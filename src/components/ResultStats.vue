<script setup>
import { formatTime } from '../format.js';

defineProps({
  found: Number,
  count: Number,
  time: Number,
  best: Number,
  record: Boolean,
});
</script>

<template>
  <ul class="stats">
    <li class="stats__item">
      <svg class="stats__icon" viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true" focusable="false">
        <path d="M12 2C7.6 2 5 5.4 5 10v11l2.3-1.8L9.7 21 12 19.2l2.3 1.8 2.4-1.8L19 21V10c0-4.6-2.6-8-7-8zm-2.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
      </svg>
      <span class="visually-hidden">Найдено</span>
      <b>{{ found }} / {{ count }}</b>
    </li>
    <li class="stats__item">
      <svg class="stats__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <span class="visually-hidden">Время</span>
      <b>{{ formatTime(time) }}</b>
    </li>
    <li v-if="best !== null" class="stats__item" :class="{ 'stats__item--record': record }">
      <svg class="stats__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M12 2l3 6.5 7 .9-5.1 4.8 1.3 7L12 17.8 5.8 21.2l1.3-7L2 9.4l7-.9z" />
      </svg>
      <span class="visually-hidden">{{ record ? 'Новый рекорд' : 'Рекорд' }}</span>
      <b>{{ formatTime(best) }}</b>
    </li>
  </ul>
</template>
